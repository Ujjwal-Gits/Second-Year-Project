const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const HamroAgent = require("../models/Agent");
const Follower = require("../models/Follower");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const UserPreference = require("../models/UserPreference");
const ListingView = require("../models/ListingView");
const { Op } = require("sequelize");
const authMiddleware = require("../middleware/authMiddleware");

// ─── Season Helper ────────────────────────────────────────────────────────────
// Nepal seasons: Spring Mar-May | Summer Jun-Aug | Autumn Sep-Nov | Winter Dec-Feb
function getCurrentSeason() {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}

// ─── Optional auth (never blocks) ────────────────────────────────────────────
function optionalAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return next();
  authMiddleware(req, res, next);
}

// ─── Build preference profile from booking history ────────────────────────────
async function buildPreferenceProfile(userId, userRole) {
  try {
    const whereClause =
      userRole === "traveller"
        ? {
            travellerId: userId,
            status: { [Op.in]: ["confirmed", "completed"] },
          }
        : { agentId: userId };

    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        {
          model: Listing,
          as: "listing",
          attributes: ["type", "difficulty", "tags", "location", "price"],
          required: false,
        },
      ],
      limit: 50,
      order: [["createdAt", "DESC"]],
    });

    if (!bookings.length) return null;

    const typeCounts = {},
      difficultyCounts = {},
      tagCounts = {},
      locationCounts = {};
    let totalSpend = 0,
      spendCount = 0;

    for (const b of bookings) {
      const l = b.listing;
      if (!l) continue;
      typeCounts[l.type] = (typeCounts[l.type] || 0) + 1;
      if (l.difficulty)
        difficultyCounts[l.difficulty] =
          (difficultyCounts[l.difficulty] || 0) + 1;
      (l.tags || []).forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
      if (l.location)
        locationCounts[l.location] = (locationCounts[l.location] || 0) + 1;
      if (b.totalAmount) {
        totalSpend += parseFloat(b.totalAmount);
        spendCount++;
      }
    }

    const topN = (obj, n = 3) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([k]) => k);

    const profile = {
      userId,
      userRole,
      preferredTypes: topN(typeCounts),
      preferredDifficulties: topN(difficultyCounts),
      preferredTags: topN(tagCounts, 5),
      preferredLocations: topN(locationCounts, 3),
      avgSpend: spendCount ? totalSpend / spendCount : 0,
      sampleSize: bookings.length,
    };

    await UserPreference.upsert(profile, { conflictFields: ["userId"] });
    return profile;
  } catch (err) {
    console.error("[Preference build error]", err.message);
    return null;
  }
}

// ─── Build session signal from recent views ───────────────────────────────────
// Returns a lightweight "interest profile" derived from what this session viewed.
// Works for guests (sessionId only) and logged-in users.
async function buildSessionSignal(sessionId, userId) {
  try {
    const where = userId
      ? { [Op.or]: [{ sessionId }, { userId }] }
      : { sessionId };

    const views = await ListingView.findAll({
      where,
      order: [["updatedAt", "DESC"]],
      limit: 30,
    });

    if (!views.length) return null;

    // Weight recent views more (decay by position)
    const typeCounts = {},
      locationCounts = {},
      tagCounts = {},
      difficultyCounts = {};
    let totalPrice = 0,
      priceCount = 0;

    views.forEach((v, idx) => {
      const weight = Math.max(1, 10 - idx); // most recent = weight 10, older = lower
      if (v.listingType)
        typeCounts[v.listingType] =
          (typeCounts[v.listingType] || 0) + weight * v.viewCount;
      if (v.listingLocation)
        locationCounts[v.listingLocation] =
          (locationCounts[v.listingLocation] || 0) + weight * v.viewCount;
      if (v.listingDifficulty)
        difficultyCounts[v.listingDifficulty] =
          (difficultyCounts[v.listingDifficulty] || 0) + weight;
      (v.listingTags || []).forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + weight;
      });
      if (v.listingPrice) {
        totalPrice += v.listingPrice * weight;
        priceCount += weight;
      }
    });

    const topN = (obj, n = 3) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([k]) => k);

    return {
      preferredTypes: topN(typeCounts),
      preferredLocations: topN(locationCounts, 5),
      preferredTags: topN(tagCounts, 8),
      preferredDifficulties: topN(difficultyCounts),
      avgPrice: priceCount ? totalPrice / priceCount : 0,
      // Raw counts for boost calculation
      typeCounts,
      locationCounts,
      tagCounts,
      difficultyCounts,
      totalViews: views.reduce((s, v) => s + v.viewCount, 0),
    };
  } catch (err) {
    console.error("[Session signal error]", err.message);
    return null;
  }
}

// ─── Core Scorer ─────────────────────────────────────────────────────────────
// Returns a relevance score 0–100 for a listing.
// sessionSignal is the real-time behavioral data (views).
// preference is the long-term booking-derived profile.
function scoreListing(listing, { season, sessionSignal, preference }) {
  let score = 40; // base

  // ── 1. Season match (±20) ──
  if (listing.bestSeasons?.length) {
    if (listing.bestSeasons.includes(season)) score += 20;
    else score -= 10;
  }

  // ── 2. Real-time session signal — 30% boost logic ──
  // This is the "Annapurna effect": if you viewed Annapurna listings,
  // similar listings get boosted by up to 30 points.
  if (sessionSignal) {
    const {
      typeCounts,
      locationCounts,
      tagCounts,
      difficultyCounts,
      totalViews,
    } = sessionSignal;

    // Type affinity — proportional to view share
    if (listing.type && typeCounts[listing.type]) {
      const typeShare = typeCounts[listing.type] / Math.max(totalViews, 1);
      score += Math.round(typeShare * 30); // up to +30
    }

    // Location affinity — strongest signal (same location = big boost)
    if (listing.location && locationCounts[listing.location]) {
      const locShare =
        locationCounts[listing.location] / Math.max(totalViews, 1);
      score += Math.round(locShare * 25); // up to +25
    }

    // Tag overlap
    const tagBoost = (listing.tags || []).reduce((sum, t) => {
      return (
        sum +
        (tagCounts[t]
          ? Math.round((tagCounts[t] / Math.max(totalViews, 1)) * 15)
          : 0)
      );
    }, 0);
    score += Math.min(tagBoost, 20); // cap at +20

    // Difficulty affinity
    if (listing.difficulty && difficultyCounts[listing.difficulty]) {
      const diffShare =
        difficultyCounts[listing.difficulty] / Math.max(totalViews, 1);
      score += Math.round(diffShare * 10);
    }

    // Price proximity to session avg
    if (sessionSignal.avgPrice > 0 && listing.price) {
      const ratio = parseFloat(listing.price) / sessionSignal.avgPrice;
      if (ratio >= 0.6 && ratio <= 1.4) score += 8;
    }
  }

  // ── 3. Long-term preference (booking history) ──
  if (preference) {
    if (preference.preferredTypes?.includes(listing.type)) score += 12;
    if (
      listing.difficulty &&
      preference.preferredDifficulties?.includes(listing.difficulty)
    )
      score += 8;
    const tagOverlap = (listing.tags || []).filter((t) =>
      preference.preferredTags?.includes(t),
    ).length;
    score += tagOverlap * 4;
    if (
      listing.location &&
      preference.preferredLocations?.includes(listing.location)
    )
      score += 8;
    if (preference.avgSpend > 0 && listing.price) {
      const ratio = parseFloat(listing.price) / preference.avgSpend;
      if (ratio >= 0.5 && ratio <= 1.5) score += 8;
    }
  }

  // ── 4. Quality signals ──
  if (listing.avgRating >= 4.5) score += 8;
  else if (listing.avgRating >= 4.0) score += 4;
  if (listing.reviewCount >= 10) score += 5;
  if (listing.agent?.verified) score += 5;

  return Math.max(0, Math.min(100, score));
}

// ─── Agent Scorer ─────────────────────────────────────────────────────────────
function scoreAgent(agent, { season, sessionSignal, preference }) {
  let score = 40;
  const services = agent.serviceTypes || [];

  if (["spring", "autumn"].includes(season)) {
    if (services.includes("trekking") || services.includes("travel"))
      score += 15;
  }
  if (["summer", "winter"].includes(season)) {
    if (services.includes("hotel")) score += 10;
  }

  if (sessionSignal) {
    const { typeCounts, locationCounts, totalViews } = sessionSignal;
    const typeBoost = services.reduce((s, t) => s + (typeCounts[t] || 0), 0);
    score += Math.round((typeBoost / Math.max(totalViews, 1)) * 25);
    if (agent.location && locationCounts[agent.location]) {
      score += Math.round(
        (locationCounts[agent.location] / Math.max(totalViews, 1)) * 20,
      );
    }
  }

  if (preference) {
    const typeOverlap = services.filter((s) =>
      preference.preferredTypes?.includes(s),
    ).length;
    score += typeOverlap * 10;
    if (
      agent.location &&
      preference.preferredLocations?.includes(agent.location)
    )
      score += 8;
  }

  score += Math.min((agent.listings?.length || 0) * 2, 10);
  score += Math.min(agent.followers?.length || 0, 5);

  return Math.max(0, Math.min(100, score));
}

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/public/listings/:id/view
// Called by frontend when a listing card is clicked or detail page opens.
// Body: { sessionId }
// ══════════════════════════════════════════════════════════════════════════════
router.post("/listings/:id/view", optionalAuth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId)
      return res.status(400).json({ error: "sessionId required" });

    const listing = await Listing.findByPk(req.params.id, {
      attributes: ["id", "type", "location", "tags", "difficulty", "price"],
    });
    if (!listing) return res.status(404).json({ error: "Not found" });

    // Upsert: increment viewCount if same session already viewed this listing
    const existing = await ListingView.findOne({
      where: { listingId: req.params.id, sessionId },
    });

    if (existing) {
      await existing.update({ viewCount: existing.viewCount + 1 });
    } else {
      await ListingView.create({
        listingId: req.params.id,
        sessionId,
        userId: req.user?.id || null,
        userRole: req.user?.role || null,
        listingType: listing.type,
        listingLocation: listing.location,
        listingTags: listing.tags || [],
        listingDifficulty: listing.difficulty,
        listingPrice: listing.price ? parseFloat(listing.price) : null,
      });
    }

    // Also rebuild preference profile in background if logged in
    if (req.user) {
      buildPreferenceProfile(req.user.id, req.user.role).catch(() => {});
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("[View track error]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/public/listings
// Query params:
//   search, type, minPrice, maxPrice, difficulty, season,
//   tags (comma-separated), location,
//   sort (relevance|price_asc|price_desc|rating|newest)
//   sessionId — browser session UUID for real-time personalization
// ══════════════════════════════════════════════════════════════════════════════
router.get("/listings", optionalAuth, async (req, res) => {
  try {
    const {
      search,
      type,
      minPrice,
      maxPrice,
      difficulty,
      season: seasonParam,
      tags,
      location,
      sort = "relevance",
      sessionId,
    } = req.query;

    const season = seasonParam || getCurrentSeason();

    // ── SQL WHERE ──
    let where = { isActive: true };
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (type && type !== "all") where.type = type;
    if (difficulty) where.difficulty = difficulty;
    if (location) where.location = { [Op.iLike]: `%${location}%` };
    if (minPrice)
      where.price = { ...where.price, [Op.gte]: parseFloat(minPrice) };
    if (maxPrice)
      where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };
    if (tags) {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagList.length) where.tags = { [Op.contains]: tagList };
    }

    const listings = await Listing.findAll({
      where,
      include: [
        {
          model: HamroAgent,
          as: "agent",
          attributes: ["id", "companyName", "verified", "location"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // ── Load signals in parallel ──
    const [sessionSignal, preference] = await Promise.all([
      sessionId
        ? buildSessionSignal(sessionId, req.user?.id)
        : Promise.resolve(null),
      req.user
        ? UserPreference.findOne({ where: { userId: req.user.id } }).then(
            (cached) =>
              cached?.sampleSize > 0
                ? cached
                : buildPreferenceProfile(req.user.id, req.user.role),
          )
        : Promise.resolve(null),
    ]);

    // ── Score ──
    const scored = listings.map((l) => {
      const plain = l.toJSON();
      plain._score = scoreListing(plain, { season, sessionSignal, preference });
      return plain;
    });

    // ── Sort ──
    if (sort === "relevance") {
      scored.sort((a, b) => b._score - a._score);
    } else if (sort === "price_asc") {
      scored.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sort === "price_desc") {
      scored.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sort === "rating") {
      scored.sort((a, b) => b.avgRating - a.avgRating);
    }
    // newest → already DESC from DB

    res.json(
      scored.map(({ _score, ...rest }) => ({
        ...rest,
        relevanceScore: _score,
      })),
    );
  } catch (err) {
    console.error("Public listings error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/public/agents/verified
// ══════════════════════════════════════════════════════════════════════════════
router.get("/agents/verified", optionalAuth, async (req, res) => {
  try {
    const { serviceType, location, sort = "relevance", sessionId } = req.query;
    const season = getCurrentSeason();

    let agentWhere = { verified: true };
    if (location) agentWhere.location = { [Op.iLike]: `%${location}%` };

    const agents = await HamroAgent.findAll({
      where: agentWhere,
      attributes: {
        exclude: [
          "password",
          "panImage",
          "citizenshipImage",
          "panNumber",
          "citizenshipNumber",
          "citizenshipDistrict",
          "citizenshipIssueDate",
        ],
      },
      include: [
        {
          model: Listing,
          as: "listings",
          where: { isActive: true },
          required: false,
          attributes: ["id", "type"],
        },
        {
          model: Follower,
          as: "followers",
          required: false,
          attributes: ["travellerId"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    let filtered = agents;
    if (serviceType && serviceType !== "all") {
      filtered = agents.filter((a) =>
        (a.serviceTypes || []).includes(serviceType),
      );
    }

    const [sessionSignal, preference] = await Promise.all([
      sessionId
        ? buildSessionSignal(sessionId, req.user?.id)
        : Promise.resolve(null),
      req.user
        ? UserPreference.findOne({ where: { userId: req.user.id } }).then(
            (c) =>
              c?.sampleSize > 0
                ? c
                : buildPreferenceProfile(req.user.id, req.user.role),
          )
        : Promise.resolve(null),
    ]);

    const scored = filtered.map((a) => {
      const plain = a.toJSON();
      plain._score = scoreAgent(plain, { season, sessionSignal, preference });
      return plain;
    });

    if (sort === "relevance") scored.sort((a, b) => b._score - a._score);
    else if (sort === "followers")
      scored.sort(
        (a, b) => (b.followers?.length || 0) - (a.followers?.length || 0),
      );
    else if (sort === "listings")
      scored.sort(
        (a, b) => (b.listings?.length || 0) - (a.listings?.length || 0),
      );

    res.json(
      scored.map(({ _score, ...rest }) => ({
        ...rest,
        relevanceScore: _score,
      })),
    );
  } catch (err) {
    console.error("Verified agents error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/public/listings/:id
// ══════════════════════════════════════════════════════════════════════════════
router.get("/listings/:id", async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [
        {
          model: HamroAgent,
          as: "agent",
          attributes: [
            "id",
            "companyName",
            "phoneNo",
            "email",
            "fullName",
            "verified",
            "location",
          ],
        },
      ],
    });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json({ listing, company: listing.agent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/public/reviews
// ══════════════════════════════════════════════════════════════════════════════
router.get("/reviews", async (req, res) => {
  try {
    const { companyName, listingId } = req.query;
    let where = {};
    if (companyName) where.companyName = companyName;
    if (listingId) where.listingId = listingId;
    const reviews = await Review.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
