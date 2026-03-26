const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authMiddleware = require("../middleware/authMiddleware");
const prisma = require("../config/prisma");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// per-user rate limits: 20 messages/day, 5 messages/minute
const rateLimits = new Map();
const DAILY_LIMIT = 20;
const MINUTE_LIMIT = 5;

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
  if (u.daily.date !== today) u.daily = { count: 0, date: today };
  if (now - u.minute.ts > 60_000) u.minute = { count: 0, ts: now };

  if (u.daily.count >= DAILY_LIMIT)
    return {
      allowed: false,
      reason: `Daily limit of ${DAILY_LIMIT} messages reached. Resets tomorrow.`,
      remaining: 0,
    };
  if (u.minute.count >= MINUTE_LIMIT) {
    const wait = Math.ceil((60_000 - (now - u.minute.ts)) / 1000);
    return {
      allowed: false,
      reason: `Too many requests. Please wait ${wait}s.`,
      remaining: DAILY_LIMIT - u.daily.count,
    };
  }

  u.daily.count++;
  u.minute.count++;
  return { allowed: true, remaining: DAILY_LIMIT - u.daily.count };
}

async function fetchRelevantListings(query) {
  try {
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const orClauses = keywords.flatMap((k) => [
      { title: { contains: k, mode: "insensitive" } },
      { description: { contains: k, mode: "insensitive" } },
      { location: { contains: k, mode: "insensitive" } },
    ]);

    return await prisma.listing.findMany({
      where: { isActive: true, OR: orClauses.length ? orClauses : undefined },
      include: {
        agent: { select: { id: true, companyName: true, verified: true } },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("[fetchRelevantListings]", err.message);
    return [];
  }
}

function buildListingContext(listings) {
  if (!listings.length)
    return "No specific listings found in the database for this query.";
  return listings
    .map((l) =>
      [
        `LISTING_ID:${l.id}`,
        `Title: ${l.title}`,
        `Type: ${l.type}`,
        `Price: NPR ${parseFloat(l.price).toLocaleString()}`,
        `Duration: ${l.duration} day(s)`,
        `Location: ${l.location || "Nepal"}`,
        `Difficulty: ${l.difficulty || "N/A"}`,
        `Best Seasons: ${(l.bestSeasons || []).join(", ") || "Year-round"}`,
        `Tags: ${(l.tags || []).join(", ") || "N/A"}`,
        `Agent: ${l.agent?.companyName || "Hamroyatra Partner"} (AGENT_ID:${l.agent?.id || ""})`,
        `Verified: ${l.agent?.verified ? "Yes" : "No"}`,
        `Description: ${(l.description || "").slice(0, 200)}`,
      ].join("\n"),
    )
    .join("\n\n---\n\n");
}

function buildSystemPrompt(listingContext, userName) {
  return `You are HamroYatra AI — a professional, warm, and knowledgeable Nepal travel planning assistant.

Your personality:
- Expert in Nepal travel: trekking, hotels, cultural tours, wildlife safaris
- Warm but professional — like a seasoned local guide
- Concise and actionable — no fluff
- Always suggest real listings from the database when relevant

IMPORTANT FORMATTING RULES:
1. When you mention a listing: [[LISTING:listing_id|Display Text]]
2. When you mention an agent/company: [[AGENT:agent_id|Company Name]]
3. For itineraries, use numbered days: "Day 1:", "Day 2:", etc.
4. Keep responses under 400 words unless the user asks for a full itinerary.
5. Always end with a helpful follow-up question or suggestion.

Current user: ${userName}

AVAILABLE LISTINGS FROM DATABASE:
${listingContext}`;
}

router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim())
      return res.status(400).json({ error: "Message required" });

    const userName =
      req.user?.fullName || req.user?.email?.split("@")[0] || "Traveller";
    const limit = checkRateLimit(req.user.id);
    if (!limit.allowed)
      return res.status(429).json({ error: limit.reason, remaining: 0 });

    const relevantListings = await fetchRelevantListings(message);
    const listingContext = buildListingContext(relevantListings);
    const systemPrompt = buildSystemPrompt(listingContext, userName);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: { parts: [{ text: systemPrompt }] },
    });

    const geminiHistory = history.map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content || " " }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage([{ text: message }]);
    const responseText = result.response.text();

    const listingRefs = {};
    relevantListings.forEach((l) => {
      listingRefs[l.id] = {
        id: l.id,
        title: l.title,
        agentId: l.agentId,
        agentName: l.agent?.companyName,
      };
    });

    res.json({ reply: responseText, listingRefs, remaining: limit.remaining });
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
