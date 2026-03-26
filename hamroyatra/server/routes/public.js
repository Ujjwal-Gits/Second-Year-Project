// Public routes — listings, agents, reviews, view tracking, recommendation scoring

const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const authMiddleware = require("../middleware/authMiddleware");

function getCurrentSeason() {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}

function optionalAuth(req, res, next) {
  const token = req.cookies?.hv_token;
  if (!token) return next();
  authMiddleware(req, res, next);
}

async function buildPreferenceProfile(userId, userRole) {
  try {
    const where =
      userRole === "traveller"
        ? { travellerId: userId, status: { in: ["confirmed", "completed"] } }
        : { agentId: userId };

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        listing: {
          select: {
            type: true,
            difficulty: true,
            tags: true,
            location: true,
            price: true,
          },
        },
      },
      take: 50,
      orderBy: { createdAt: "desc" },
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

    await prisma.userPreference.upsert({
      where: { userId },
      update: profile,
      create: profile,
    });
    return profile;
  } catch (err) {
    console.error("[Preference build error]", err.message);
    return null;
  }
}

async function buildSessionSignal(sessionId, userId) {
  try {
    const where = userId ? { OR: [{ sessionId }, { userId }] } : { sessionId };

    const views = await prisma.listingView.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 30,
    });

    if (!views.length) return null;

    const typeCounts = {},
      locationCounts = {},
      tagCounts = {},
      difficultyCounts = {};
    let totalPrice = 0,
      priceCount = 0;

    views.forEach((v, idx) => {
      const weight = Math.max(1, 10 - idx);
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

function scoreListing(listing, { season, sessionSignal, preference }) {
  let score = 40;
  if (listing.bestSeasons?.length) {
    if (listing.bestSeasons.includes(season)) score += 20;
    else score -= 10;
  }
  if (sessionSignal) {
    const {
      typeCounts,
      locationCounts,
      tagCounts,
      difficultyCounts,
      totalViews,
    } = sessionSignal;
    if (listing.type && typeCounts[listing.type])
      score += Math.round(
        (typeCounts[listing.type] / Math.max(totalViews, 1)) * 30,
      );
    if (listing.location && locationCounts[listing.location])
      score += Math.round(
        (locationCounts[listing.location] / Math.max(totalViews, 1)) * 25,
      );
    const tagBoost = (listing.tags || []).reduce(
      (sum, t) =>
        sum +
        (tagCounts[t]
          ? Math.round((tagCounts[t] / Math.max(totalViews, 1)) * 15)
          : 0),
      0,
    );
    score += Math.min(tagBoost, 20);
    if (listing.difficulty && difficultyCounts[listing.difficulty])
      score += Math.round(
        (difficultyCounts[listing.difficulty] / Math.max(totalViews, 1)) * 10,
      );
    if (sessionSignal.avgPrice > 0 && listing.price) {
      const ratio = parseFloat(listing.price) / sessionSignal.avgPrice;
      if (ratio >= 0.6 && ratio <= 1.4) score += 8;
    }
  }
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
  if (listing.avgRating >= 4.5) score += 8;
  else if (listing.avgRating >= 4.0) score += 4;
  if (listing.reviewCount >= 10) score += 5;
  if (listing.agent?.verified) score += 5;
  return Math.max(0, Math.min(100, score));
}

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
    if (agent.location && locationCounts[agent.location])
      score += Math.round(
        (locationCounts[agent.location] / Math.max(totalViews, 1)) * 20,
      );
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

// POST /api/public/listings/:id/view
router.post("/listings/:id/view", optionalAuth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId)
      return res.status(400).json({ error: "sessionId required" });

    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        type: true,
        location: true,
        tags: true,
        difficulty: true,
        price: true,
      },
    });
    if (!listing) return res.status(404).json({ error: "Not found" });

    const existing = await prisma.listingView.findFirst({
      where: { listingId: req.params.id, sessionId },
    });

    if (existing) {
      await prisma.listingView.update({
        where: { id: existing.id },
        data: { viewCount: existing.viewCount + 1 },
      });
    } else {
      await prisma.listingView.create({
        data: {
          listingId: req.params.id,
          sessionId,
          userId: req.user?.id || null,
          userRole: req.user?.role || null,
          listingType: listing.type,
          listingLocation: listing.location,
          listingTags: listing.tags || [],
          listingDifficulty: listing.difficulty,
          listingPrice: listing.price ? parseFloat(listing.price) : null,
        },
      });
    }

    if (req.user)
      buildPreferenceProfile(req.user.id, req.user.role).catch(() => {});
    res.json({ ok: true });
  } catch (err) {
    console.error("[View track error]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/public/listings
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

    const where = { isActive: true };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }
    if (type && type !== "all") where.type = type;
    if (difficulty) where.difficulty = difficulty;
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
    if (tags) {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagList.length) where.tags = { hasEvery: tagList };
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            companyName: true,
            verified: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const [sessionSignal, preference] = await Promise.all([
      sessionId ? buildSessionSignal(sessionId, req.user?.id) : null,
      req.user
        ? prisma.userPreference
            .findUnique({ where: { userId: req.user.id } })
            .then((cached) =>
              cached?.sampleSize > 0
                ? cached
                : buildPreferenceProfile(req.user.id, req.user.role),
            )
        : null,
    ]);

    const scored = listings.map((l) => ({
      ...l,
      _score: scoreListing(l, { season, sessionSignal, preference }),
    }));

    if (sort === "relevance") scored.sort((a, b) => b._score - a._score);
    else if (sort === "price_asc")
      scored.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    else if (sort === "price_desc")
      scored.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    else if (sort === "rating")
      scored.sort((a, b) => b.avgRating - a.avgRating);

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

// GET /api/public/agents/verified
router.get("/agents/verified", optionalAuth, async (req, res) => {
  try {
    const { serviceType, location, sort = "relevance", sessionId } = req.query;
    const season = getCurrentSeason();

    const where = { verified: true };
    if (location) where.location = { contains: location, mode: "insensitive" };

    let agents = await prisma.hamroAgent.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        location: true,
        phoneNo: true,
        companyName: true,
        bio: true,
        profileImage: true,
        coverImage: true,
        website: true,
        socialLinks: true,
        verified: true,
        role: true,
        legalCompanyName: true,
        companyOwner: true,
        ownerContactNo: true,
        serviceTypes: true,
        gender: true,
        verificationStatus: true,
        parentAgentId: true,
        createdAt: true,
        updatedAt: true,
        listings: {
          where: { isActive: true },
          select: { id: true, type: true },
        },
        followers: { select: { travellerId: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (serviceType && serviceType !== "all") {
      agents = agents.filter((a) =>
        (a.serviceTypes || []).includes(serviceType),
      );
    }

    const [sessionSignal, preference] = await Promise.all([
      sessionId ? buildSessionSignal(sessionId, req.user?.id) : null,
      req.user
        ? prisma.userPreference
            .findUnique({ where: { userId: req.user.id } })
            .then((c) =>
              c?.sampleSize > 0
                ? c
                : buildPreferenceProfile(req.user.id, req.user.role),
            )
        : null,
    ]);

    const scored = agents.map((a) => ({
      ...a,
      _score: scoreAgent(a, { season, sessionSignal, preference }),
    }));

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

// GET /api/public/listings/:id
router.get("/listings/:id", async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        agent: {
          select: {
            id: true,
            companyName: true,
            phoneNo: true,
            email: true,
            fullName: true,
            verified: true,
            location: true,
          },
        },
      },
    });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json({ listing, company: listing.agent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/public/reviews
router.get("/reviews", async (req, res) => {
  try {
    const { companyName, listingId } = req.query;
    const where = {};
    if (companyName) where.companyName = companyName;
    if (listingId) where.listingId = listingId;
    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
