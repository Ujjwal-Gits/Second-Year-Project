// This is the AI Plan chat route — powers the HamroYatra AI chatbot on the /plan page.
// It fetches relevant listings from the DB, builds a context prompt, and sends it to Gemini.
// It also enforces per-user rate limits (20 messages/day, 5 messages/minute) to protect the free API quota.

const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authMiddleware = require("../middleware/authMiddleware");
const Listing = require("../models/Listing");
const HamroAgent = require("../models/Agent");
const { Op } = require("sequelize");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Rate limiting (in-memory) ────────────────────────────────────────────────
// { userId: { daily: { count, date }, minute: { count, ts } } }
const rateLimits = new Map();

const DAILY_LIMIT = 20; // messages per user per day
const MINUTE_LIMIT = 5; // messages per user per minute

function checkRateLimit(userId) {
  const now = Date.now();
  const today = new Date().toDateString();

  if (!rateLimits.has(userId)) {
    rateLimits.set(userId, {
      daily: { count: 0, date: today },
      minute: { count: 0, ts: now },
    });
  }

  const u = rateLimits.get(userId);

  // Reset daily counter if new day
  if (u.daily.date !== today) {
    u.daily = { count: 0, date: today };
  }

  // Reset minute counter if >60s passed
  if (now - u.minute.ts > 60_000) {
    u.minute = { count: 0, ts: now };
  }

  if (u.daily.count >= DAILY_LIMIT) {
    return {
      allowed: false,
      reason: `Daily limit of ${DAILY_LIMIT} messages reached. Resets tomorrow.`,
      remaining: 0,
    };
  }
  if (u.minute.count >= MINUTE_LIMIT) {
    const wait = Math.ceil((60_000 - (now - u.minute.ts)) / 1000);
    return {
      allowed: false,
      reason: `Too many requests. Please wait ${wait}s before sending again.`,
      remaining: DAILY_LIMIT - u.daily.count,
    };
  }

  // Increment
  u.daily.count++;
  u.minute.count++;

  return { allowed: true, remaining: DAILY_LIMIT - u.daily.count };
}

// ─── Fetch relevant listings from DB based on keywords ───────────────────────
async function fetchRelevantListings(query) {
  try {
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const orClauses = keywords.flatMap((k) => [
      { title: { [Op.iLike]: `%${k}%` } },
      { description: { [Op.iLike]: `%${k}%` } },
      { location: { [Op.iLike]: `%${k}%` } },
    ]);

    const listings = await Listing.findAll({
      where: {
        isActive: true,
        [Op.or]: orClauses.length ? orClauses : [{ isActive: true }],
      },
      include: [
        {
          model: HamroAgent,
          as: "agent",
          attributes: ["id", "companyName", "verified"],
        },
      ],
      limit: 8,
      order: [["createdAt", "DESC"]],
    });
    return listings.map((l) => l.toJSON());
  } catch (err) {
    console.error("[fetchRelevantListings]", err.message);
    return [];
  }
}

// ─── Format listings as context string for Gemini ────────────────────────────
function buildListingContext(listings) {
  if (!listings.length)
    return "No specific listings found in the database for this query.";
  return listings
    .map((l) => {
      const agent = l.agent;
      return [
        `LISTING_ID:${l.id}`,
        `Title: ${l.title}`,
        `Type: ${l.type}`,
        `Price: NPR ${parseFloat(l.price).toLocaleString()}`,
        `Duration: ${l.duration} day(s)`,
        `Location: ${l.location || "Nepal"}`,
        `Difficulty: ${l.difficulty || "N/A"}`,
        `Best Seasons: ${(l.bestSeasons || []).join(", ") || "Year-round"}`,
        `Tags: ${(l.tags || []).join(", ") || "N/A"}`,
        `Agent: ${agent?.companyName || "Hamroyatra Partner"} (AGENT_ID:${agent?.id || ""})`,
        `Verified: ${agent?.verified ? "Yes" : "No"}`,
        `Description: ${(l.description || "").slice(0, 200)}`,
      ].join("\n");
    })
    .join("\n\n---\n\n");
}

// ─── System prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(listingContext, userName) {
  return `You are HamroYatra AI — a professional, warm, and knowledgeable Nepal travel planning assistant for the HamroYatra platform.

Your personality:
- Expert in Nepal travel: trekking, hotels, cultural tours, wildlife safaris
- Warm but professional — like a seasoned local guide
- Concise and actionable — no fluff
- Always suggest real listings from the database when relevant

IMPORTANT FORMATTING RULES — follow these exactly:
1. When you mention a listing, wrap it like this: [[LISTING:listing_id|Display Text]]
   Example: [[LISTING:abc-123|Annapurna Circuit Trek by Summit Seekers]]
2. When you mention an agent/company, wrap it like this: [[AGENT:agent_id|Company Name]]
   Example: [[AGENT:xyz-456|Summit Seekers]]
3. For itineraries, use numbered days: "Day 1:", "Day 2:", etc.
4. Keep responses under 400 words unless the user asks for a full itinerary.
5. Always end with a helpful follow-up question or suggestion.

Current user: ${userName}

AVAILABLE LISTINGS FROM DATABASE:
${listingContext}

If the user asks about something not in the listings above, you can still give general Nepal travel advice, but mention that they can explore more on the platform.`;
}

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/plan/chat
// Body: { message: string, history: [{role, parts}] }
// ══════════════════════════════════════════════════════════════════════════════
router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim())
      return res.status(400).json({ error: "Message required" });

    const userName =
      req.user?.fullName || req.user?.email?.split("@")[0] || "Traveller";

    // ── Rate limit check ──
    const limit = checkRateLimit(req.user.id);
    if (!limit.allowed) {
      return res.status(429).json({ error: limit.reason, remaining: 0 });
    }

    // Fetch relevant listings based on the user's message
    const relevantListings = await fetchRelevantListings(message);
    const listingContext = buildListingContext(relevantListings);
    const systemPrompt = buildSystemPrompt(listingContext, userName);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: { parts: [{ text: systemPrompt }] },
    });

    // Convert history to Gemini format — must alternate user/model
    const geminiHistory = [];
    for (const h of history) {
      geminiHistory.push({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content || " " }],
      });
    }

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage([{ text: message }]);
    const responseText = result.response.text();

    // Extract listing/agent references so frontend can build links
    const listingRefs = {};
    relevantListings.forEach((l) => {
      listingRefs[l.id] = {
        id: l.id,
        title: l.title,
        agentId: l.agentId,
        agentName: l.agent?.companyName,
      };
    });

    res.json({
      reply: responseText,
      listingRefs,
      remaining: limit.remaining,
    });
  } catch (err) {
    console.error("[Plan chat error]", err.message);
    const isQuota =
      err.message?.includes("429") || err.message?.includes("quota");
    res.status(500).json({
      error: isQuota
        ? "The AI is temporarily rate-limited. Please wait a moment and try again."
        : "Something went wrong. Please try again.",
    });
  }
});

module.exports = router;
