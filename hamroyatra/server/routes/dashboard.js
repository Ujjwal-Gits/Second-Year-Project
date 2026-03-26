const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const prisma = require("../config/prisma");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");

// ─── Multer ───────────────────────────────────────────────────────────────────
const storage = multer.memoryStorage(); // keep in memory, send to Cloudinary
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ok =
      /jpeg|jpg|png/.test(path.extname(file.originalname).toLowerCase()) &&
      /jpeg|jpg|png/.test(file.mimetype);
    ok
      ? cb(null, true)
      : cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
  },
});

// Cloudinary config
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "hamroyatra", type: "authenticated", resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    stream.end(buffer);
  });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const createNotification = async (
  companyName,
  type,
  title,
  message,
  targetId = null,
  travellerId = null,
  agentId = null,
) => {
  try {
    await prisma.notification.create({
      data: {
        companyName,
        type,
        title,
        message,
        targetId,
        travellerId,
        agentId,
      },
    });
  } catch (err) {
    console.error("Notification Creation Failed:", err);
  }
};

// if the agent is a sub-agent, all data belongs to the parent
const getEffectiveAgentId = async (userId) => {
  const agent = await prisma.hamroAgent.findUnique({
    where: { id: userId },
    select: { id: true, parentAgentId: true },
  });
  return agent?.parentAgentId || userId;
};

const logActivity = async (req, action, details, targetId = null) => {
  try {
    if (req.user.role !== "agent") return;
    const agent = await prisma.hamroAgent.findUnique({
      where: { id: req.user.id },
    });
    await prisma.activityLog.create({
      data: {
        agentId: req.user.id,
        agentName: agent.fullName,
        companyName: agent.companyName,
        action,
        details,
        targetId,
      },
    });
  } catch (err) {
    console.error("Activity Logging Failed:", err);
  }
};

const logTravellerActivity = async (req, action, details, targetId = null) => {
  try {
    if (req.user.role !== "traveller") return;
    const traveller = await prisma.hamroTraveller.findUnique({
      where: { id: req.user.id },
    });
    await prisma.activityLog.create({
      data: {
        travellerId: req.user.id,
        travellerName: traveller.fullName,
        action,
        details,
        targetId,
      },
    });
  } catch (err) {
    console.error("Traveller Activity Logging Failed:", err);
  }
};

// ─── UPLOAD ───────────────────────────────────────────────────────────────────
router.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const result = await uploadToCloudinary(req.file.buffer);
      res.json({ url: result.secure_url });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// ─── LISTINGS ─────────────────────────────────────────────────────────────────
router.get("/listings", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "superadmin") {
      return res.json(
        await prisma.listing.findMany({ orderBy: { createdAt: "desc" } }),
      );
    }
    const effectiveId = await getEffectiveAgentId(req.user.id);
    res.json(
      await prisma.listing.findMany({
        where: { agentId: effectiveId },
        orderBy: { createdAt: "desc" },
      }),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/listings", authMiddleware, async (req, res) => {
  try {
    const currentAgent = await prisma.hamroAgent.findUnique({
      where: { id: req.user.id },
    });
    const {
      title,
      description,
      type,
      price,
      offers,
      images,
      acRooms,
      nonAcRooms,
      familyRooms,
      coupleRooms,
      duration,
      amenities,
      itinerary,
      hotelCategory,
      acPrice,
      nonAcPrice,
      familyPrice,
      couplePrice,
    } = req.body;
    const listing = await prisma.listing.create({
      data: {
        agentId: req.user.id,
        companyName: currentAgent.companyName,
        title,
        description,
        type,
        price,
        offers,
        duration: type === "hotel" ? 1 : parseInt(duration) || 1,
        images: images || [],
        acRooms: acRooms || 0,
        nonAcRooms: nonAcRooms || 0,
        familyRooms: familyRooms || 0,
        coupleRooms: coupleRooms || 0,
        acPrice: acPrice || 0,
        nonAcPrice: nonAcPrice || 0,
        familyPrice: familyPrice || 0,
        couplePrice: couplePrice || 0,
        amenities: amenities || [],
        itinerary: itinerary || [],
        hotelCategory: type === "hotel" ? hotelCategory || "hotel" : "hotel",
      },
    });
    await logActivity(
      req,
      "CREATE_LISTING",
      `Created new ${type} listing: "${title}"`,
      listing.id,
    );
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/listings/:id", authMiddleware, async (req, res) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== "superadmin") {
      const effectiveId = await getEffectiveAgentId(req.user.id);
      where.agentId = effectiveId;
    }
    const existing = await prisma.listing.findFirst({ where });
    if (!existing)
      return res
        .status(404)
        .json({ error: "Listing not found or unauthorized" });
    const { id, agentId, companyName, ...updateData } = req.body;
    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: updateData,
    });
    await logActivity(
      req,
      "UPDATE_LISTING",
      `Updated listing: "${listing.title}"`,
      listing.id,
    );
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/listings/:id", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const listing = await prisma.listing.findFirst({
      where: { id: req.params.id, agentId: effectiveId },
    });
    if (!listing)
      return res
        .status(404)
        .json({ error: "Listing not found or unauthorized" });
    await prisma.listing.delete({ where: { id: req.params.id } });
    await logActivity(
      req,
      "DELETE_LISTING",
      `Deleted listing: "${listing.title}"`,
    );
    res.json({ message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────
router.get("/bookings", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    res.json(
      await prisma.booking.findMany({
        where: { agentId: effectiveId },
        orderBy: { createdAt: "desc" },
      }),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/traveller/bookings", authMiddleware, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { travellerId: req.user.id },
      include: {
        listing: { select: { title: true, price: true, duration: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(
      bookings.map((b) => ({
        ...b,
        title: b.listing?.title || null,
        listingPrice: b.listing ? parseFloat(b.listing.price) : null,
        listingDuration: b.listing?.duration || null,
        listing: undefined,
      })),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/bookings/calendar", authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.query;
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const bookings = await prisma.booking.findMany({
      where: {
        agentId: effectiveId,
        startDate: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
      },
      orderBy: { startDate: "asc" },
    });
    // normalize startDate to YYYY-MM-DD string for frontend date comparison
    res.json(
      bookings.map((b) => ({
        ...b,
        startDate: b.startDate
          ? new Date(b.startDate).toISOString().split("T")[0]
          : null,
        endDate: b.endDate
          ? new Date(b.endDate).toISOString().split("T")[0]
          : null,
      })),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/bookings", authMiddleware, async (req, res) => {
  try {
    const { bookingType, listingId } = req.body;
    let finalAgentId = null,
      finalCompanyName = null,
      finalStatus = "confirmed";

    if (req.user.role === "agent") {
      const currentAgent = await prisma.hamroAgent.findUnique({
        where: { id: req.user.id },
      });
      if (!currentAgent)
        return res.status(404).json({ error: "Agent profile not found" });
      finalAgentId = req.user.id;
      finalCompanyName = currentAgent.companyName;
    } else {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });
      if (!listing)
        return res.status(404).json({ error: "Listing not found for booking" });
      finalAgentId = listing.agentId;
      finalCompanyName = listing.companyName;
      finalStatus = "pending";
    }

    const count = await prisma.booking.count({
      where: { bookingType, companyName: finalCompanyName },
    });
    const prefix =
      bookingType === "room" ? "HO" : bookingType === "guide" ? "GD" : "PG";
    const serialId = `${prefix}${String(count + 1).padStart(2, "0")}`;

    const booking = await prisma.booking.create({
      data: {
        listingId: req.body.listingId || null,
        bookingType: req.body.bookingType,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        totalAmount: req.body.totalAmount || 0,
        roomCount: req.body.roomCount || 1,
        roomSelection: req.body.roomSelection || {},
        guestName: req.body.guestName || "Guest",
        guestEmail: req.body.guestEmail || null,
        guestPhone: req.body.guestPhone || null,
        notes: req.body.notes || null,
        agentId: finalAgentId,
        travellerId:
          req.user.role === "traveller"
            ? req.user.id
            : req.body.travellerId || null,
        companyName: finalCompanyName,
        status: finalStatus,
        createdBy: req.user.role === "traveller" ? "traveller" : "agent",
        serialId,
      },
    });

    if (req.user.role === "agent") {
      await logActivity(
        req,
        "CREATE_BOOKING",
        `Recorded manual booking for "${req.body.guestName}" (${bookingType})`,
        booking.id,
      );
    } else {
      await logTravellerActivity(
        req,
        "CREATE_BOOKING",
        `Reserved ${bookingType}: "${req.body.guestName}" on ${finalCompanyName}`,
        booking.id,
      );
    }

    await createNotification(
      finalCompanyName,
      "booking",
      "New Booking Enrollment",
      `${req.body.guestName} has requested a ${bookingType} service. Status: ${finalStatus.toUpperCase()}`,
      booking.id,
      null,
      finalAgentId,
    );

    res.status(201).json(booking);
  } catch (err) {
    console.error("Booking Creation Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/bookings/:id/start-trip", authMiddleware, async (req, res) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, travellerId: req.user.id },
      include: { listing: { select: { itinerary: true } } },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.tripStatus !== "pending")
      return res
        .status(400)
        .json({ error: "Trip already started or completed" });

    const checklist = (booking.listing?.itinerary || []).map((day, idx) => ({
      id: idx,
      title: day.title || `Day ${idx + 1}`,
      location: day.location || "",
      completed: false,
      review: "",
      reviewEdited: false,
      completedAt: null,
    }));

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { tripStatus: "active", checklist },
    });
    res.json({ message: "Trip started successfully", booking: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put(
  "/bookings/:id/checklist/update",
  authMiddleware,
  async (req, res) => {
    try {
      const { itemId, completed, review } = req.body;
      const booking = await prisma.booking.findFirst({
        where: { id: req.params.id, travellerId: req.user.id },
      });
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      const checklist = [...(booking.checklist || [])];
      const index = checklist.findIndex((item) => item.id == itemId);
      if (index === -1)
        return res.status(404).json({ error: "Checklist item not found" });

      checklist[index] = {
        ...checklist[index],
        completed:
          completed !== undefined ? completed : checklist[index].completed,
        review: review !== undefined ? review : checklist[index].review,
        reviewEdited:
          review !== undefined ? true : checklist[index].reviewEdited,
        completedAt:
          completed && !checklist[index].completed
            ? new Date()
            : checklist[index].completedAt,
      };

      const updated = await prisma.booking.update({
        where: { id: req.params.id },
        data: { checklist },
      });
      res.json({ message: "Progress updated", booking: updated });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

router.put("/bookings/:id", authMiddleware, async (req, res) => {
  try {
    const where =
      req.user.role === "agent"
        ? { id: req.params.id, agentId: await getEffectiveAgentId(req.user.id) }
        : { id: req.params.id, travellerId: req.user.id };

    const booking = await prisma.booking.findFirst({ where });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const ALLOWED = [
      "status",
      "paymentStatus",
      "notes",
      "guestName",
      "guestEmail",
      "listingId",
      "startDate",
      "endDate",
      "roomCount",
      "roomType",
      "roomSelection",
      "guideName",
      "totalAmount",
      "advanceAmount",
      "idType",
      "idNumber",
      "otherIdType",
      "bookingType",
    ];
    const update = {};
    ALLOWED.forEach((key) => {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    });
    if (update.startDate) update.startDate = new Date(update.startDate);
    if (update.endDate) update.endDate = new Date(update.endDate);

    const oldStatus = booking.status;
    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: update,
    });

    if (
      req.user.role === "agent" &&
      update.status &&
      update.status !== oldStatus &&
      booking.travellerId
    ) {
      await createNotification(
        booking.companyName,
        "booking",
        "Booking Status Update",
        `Your booking (${booking.serialId || "Record"}) has been ${update.status.toUpperCase()}.`,
        booking.id,
        booking.travellerId,
      );
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/bookings/:id", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, agentId: effectiveId },
    });
    if (!booking)
      return res
        .status(404)
        .json({ error: "Booking not found or unauthorized" });
    await prisma.booking.delete({ where: { id: req.params.id } });
    await logActivity(
      req,
      "DELETE_BOOKING",
      `Deleted booking record for "${booking.guestName}"`,
    );
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── TEAM ─────────────────────────────────────────────────────────────────────
router.get("/team", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const agents = await prisma.hamroAgent.findMany({
      where: { OR: [{ id: effectiveId }, { parentAgentId: effectiveId }] },
      omit: { password: true },
    });
    const guides = await prisma.guide.findMany({
      where: { agentId: effectiveId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ agents, guides });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/team/agent/send-otp", authMiddleware, async (req, res) => {
  try {
    const currentAgent = await prisma.hamroAgent.findUnique({
      where: { id: req.user.id },
    });
    if (!currentAgent)
      return res.status(404).json({ error: "Agent not found" });
    const { sendOTP } = require("../services/otpService");
    await sendOTP(currentAgent.email, "team-invite");
    res.json({ message: `OTP sent to ${currentAgent.email}` });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.post("/team/agent", authMiddleware, async (req, res) => {
  try {
    const { fullName, email, password, phoneNo, otp } = req.body;
    const currentAgent = await prisma.hamroAgent.findUnique({
      where: { id: req.user.id },
    });
    const { verifyOTP, clearOTP } = require("../services/otpService");
    const otpCheck = verifyOTP(currentAgent.email, otp);
    if (!otpCheck.valid)
      return res
        .status(403)
        .json({ error: `OTP check failed: ${otpCheck.reason}` });

    const existing = await prisma.hamroAgent.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const effectiveParentId = currentAgent.parentAgentId || currentAgent.id;
    const newAgent = await prisma.hamroAgent.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        phoneNo,
        companyName: currentAgent.companyName,
        role: "agent",
        parentAgentId: effectiveParentId,
      },
    });
    clearOTP(currentAgent.email);
    await logActivity(
      req,
      "ADD_AGENT",
      `Enrolled new team agent: ${fullName} (${email})`,
      newAgent.id,
    );
    res.status(201).json({
      message: "Team Agent created",
      agent: {
        id: newAgent.id,
        fullName: newAgent.fullName,
        email: newAgent.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/team/agent/:id", authMiddleware, async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ error: "Self-deletion is not permitted." });
    const currentAgent = await prisma.hamroAgent.findUnique({
      where: { id: req.user.id },
    });
    const targetAgent = await prisma.hamroAgent.findFirst({
      where: { id: req.params.id, companyName: currentAgent.companyName },
    });
    if (!targetAgent)
      return res
        .status(404)
        .json({ error: "Agent not found in your organization" });
    await prisma.hamroAgent.delete({ where: { id: req.params.id } });
    await logActivity(
      req,
      "DELETE_AGENT",
      `Removed agent "${targetAgent.fullName}" from company`,
    );
    res.json({ message: "Agent removed from company" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/team/agent/:id", authMiddleware, async (req, res) => {
  try {
    const { fullName, email, phoneNo } = req.body;
    const agent = await prisma.hamroAgent.findUnique({
      where: { id: req.params.id },
    });
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    const currentAgent = await prisma.hamroAgent.findUnique({
      where: { id: req.user.id },
    });
    if (agent.companyName !== currentAgent.companyName)
      return res.status(403).json({ error: "Unauthorized company mismatch" });
    const updated = await prisma.hamroAgent.update({
      where: { id: req.params.id },
      data: { fullName, email, phoneNo },
    });
    await logActivity(
      req,
      "UPDATE_TEAM",
      `Updated credentials for agent: ${fullName}`,
      agent.id,
    );
    res.json({ message: "Agent updated successfully", agent: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/team/guide", authMiddleware, async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNo,
      experienceYears,
      profileImage,
      certificateImage,
      certificateExpiry,
    } = req.body;
    const currentAgent = await prisma.hamroAgent.findUnique({
      where: { id: req.user.id },
    });
    if (!currentAgent.verified)
      return res.status(403).json({
        error:
          "Badge Verification Required. Only verified agencies can register guides.",
      });
    const newGuide = await prisma.guide.create({
      data: {
        fullName,
        email,
        phoneNo,
        experienceYears,
        profileImage,
        certificateImage,
        certificateExpiry: new Date(certificateExpiry),
        agentId: req.user.id,
        companyName: currentAgent.companyName,
      },
    });
    await logActivity(
      req,
      "ADD_GUIDE",
      `Registered new field guide: ${fullName}`,
      newGuide.id,
    );
    res
      .status(201)
      .json({ message: "Guide registered successfully", guide: newGuide });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/team/guide/:id", authMiddleware, async (req, res) => {
  try {
    const guide = await prisma.guide.findFirst({
      where: { id: req.params.id, agentId: req.user.id },
    });
    if (!guide) return res.status(404).json({ error: "Guide not found" });
    await prisma.guide.delete({ where: { id: req.params.id } });
    await logActivity(
      req,
      "DELETE_GUIDE",
      `Removed guide "${guide.fullName}" from company`,
    );
    res.json({ message: "Guide removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/team/guide/:id", authMiddleware, async (req, res) => {
  try {
    const guide = await prisma.guide.findFirst({
      where: { id: req.params.id, agentId: req.user.id },
    });
    if (!guide) return res.status(404).json({ error: "Guide not found" });
    const updated = await prisma.guide.update({
      where: { id: req.params.id },
      data: req.body,
    });
    await logActivity(
      req,
      "UPDATE_GUIDE",
      `Updated field profile for guide: ${req.body.fullName}`,
      guide.id,
    );
    res.json({ message: "Guide updated successfully", guide: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
router.get("/analytics", authMiddleware, async (req, res) => {
  try {
    const agentId = await getEffectiveAgentId(req.user.id);
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [
      allBookings,
      totalBookings,
      totalRevenue,
      thisMonthRevenue,
      recentBookings,
    ] = await Promise.all([
      prisma.booking.findMany({
        where: {
          agentId,
          status: { not: "cancelled" },
          createdAt: { gte: threeMonthsAgo },
        },
      }),
      prisma.booking.count({ where: { agentId } }),
      prisma.booking.aggregate({
        where: { agentId, status: { not: "cancelled" } },
        _sum: { totalAmount: true },
      }),
      prisma.booking.aggregate({
        where: {
          agentId,
          status: { not: "cancelled" },
          createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        },
        _sum: { totalAmount: true },
      }),
      prisma.booking.findMany({
        where: { agentId },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    // Daily revenue
    const dailyMap = {};
    allBookings.forEach((b) => {
      const day = b.createdAt.toISOString().split("T")[0];
      dailyMap[day] = {
        revenue: (dailyMap[day]?.revenue || 0) + parseFloat(b.totalAmount || 0),
        count: (dailyMap[day]?.count || 0) + 1,
      };
    });
    const revenueDaily = Object.entries(dailyMap)
      .map(([day, v]) => ({ day, ...v }))
      .sort((a, b) => a.day.localeCompare(b.day));

    // Bookings by type
    const typeMap = {};
    allBookings.forEach((b) => {
      typeMap[b.bookingType] = typeMap[b.bookingType] || {
        bookingType: b.bookingType,
        count: 0,
        revenue: 0,
      };
      typeMap[b.bookingType].count++;
      typeMap[b.bookingType].revenue += parseFloat(b.totalAmount || 0);
    });

    res.json({
      revenueDaily,
      bookingsByType: Object.values(typeMap),
      totalBookings,
      totalRevenue: parseFloat(totalRevenue._sum.totalAmount || 0),
      thisMonthRevenue: parseFloat(thisMonthRevenue._sum.totalAmount || 0),
      recentBookings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CUSTOMERS ────────────────────────────────────────────────────────────────
router.get("/customers", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const bookings = await prisma.booking.findMany({
      where: { agentId: effectiveId },
      orderBy: { createdAt: "desc" },
    });
    const customersMap = new Map();
    for (const b of bookings) {
      const key = `${b.guestName.toLowerCase()}-${(b.guestEmail || "").toLowerCase()}`;
      if (!customersMap.has(key))
        customersMap.set(key, {
          name: b.guestName,
          email: b.guestEmail,
          phone: b.guestPhone,
          bookings: [],
        });
      customersMap.get(key).bookings.push({
        id: b.id,
        type: b.bookingType,
        serialId: b.serialId,
        date: b.startDate,
        status: b.status,
      });
    }
    res.json(Array.from(customersMap.values()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── HISTORY ──────────────────────────────────────────────────────────────────
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    res.json(
      await prisma.activityLog.findMany({
        where: { agentId: effectiveId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
router.get("/reviews", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const agent = await prisma.hamroAgent.findUnique({
      where: { id: effectiveId },
    });
    res.json(
      await prisma.review.findMany({
        where: { companyName: agent.companyName },
        orderBy: { createdAt: "desc" },
      }),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/public/review", async (req, res) => {
  try {
    const {
      companyName,
      customerName,
      rating,
      message,
      serviceType,
      listingId,
    } = req.body;
    const review = await prisma.review.create({
      data: {
        companyName,
        customerName,
        rating,
        message,
        serviceType,
        listingId,
        status: "pending",
      },
    });
    await createNotification(
      companyName,
      "review",
      "New Public Review",
      `${customerName} gave a ${rating}-star rating for ${serviceType || "a service"}.`,
      review.id,
    );
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    res.json(
      await prisma.notification.findMany({
        where: { agentId: effectiveId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/traveller/notifications", authMiddleware, async (req, res) => {
  try {
    res.json(
      await prisma.notification.findMany({
        where: { travellerId: req.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/notifications/mark-read", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    await prisma.notification.updateMany({
      where: { agentId: effectiveId, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
router.get("/messages", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const messages = await prisma.message.findMany({
      where: { agentId: effectiveId },
      orderBy: { createdAt: "desc" },
    });
    const threadsMap = {};
    messages.forEach((m) => {
      const email = m.customerEmail;
      if (!threadsMap[email]) threadsMap[email] = { ...m, unreadCount: 0 };
      if (m.status === "unread" && m.senderRole === "traveller")
        threadsMap[email].unreadCount++;
    });
    res.json(Object.values(threadsMap));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get(
  "/messages/conversation/:email",
  authMiddleware,
  async (req, res) => {
    try {
      const effectiveId = await getEffectiveAgentId(req.user.id);
      res.json(
        await prisma.message.findMany({
          where: { agentId: effectiveId, customerEmail: req.params.email },
          orderBy: { createdAt: "asc" },
        }),
      );
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

router.put("/messages/:id/read", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const message = await prisma.message.findFirst({
      where: { id: req.params.id, agentId: effectiveId },
    });
    if (!message) return res.status(404).json({ error: "Message not found" });
    await prisma.message.updateMany({
      where: {
        agentId: effectiveId,
        customerEmail: message.customerEmail,
        senderRole: "traveller",
        status: "unread",
      },
      data: { status: "read" },
    });
    res.json({ message: "Conversation marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/messages/:id/reply", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const currentAgent = await prisma.hamroAgent.findUnique({
      where: { id: effectiveId },
    });
    const originalMessage = await prisma.message.findFirst({
      where: { id: req.params.id, agentId: effectiveId },
    });
    if (!originalMessage)
      return res.status(404).json({ error: "Message not found" });

    const reply = await prisma.message.create({
      data: {
        companyName: currentAgent.companyName,
        customerName: originalMessage.customerName,
        customerEmail: originalMessage.customerEmail,
        travellerId: originalMessage.travellerId,
        agentId: effectiveId,
        subject: `Re: ${originalMessage.subject}`,
        message: req.body.message,
        senderRole: "agent",
        status: "unread",
      },
    });
    await prisma.message.updateMany({
      where: {
        agentId: effectiveId,
        customerEmail: originalMessage.customerEmail,
        senderRole: "traveller",
      },
      data: { status: "replied" },
    });
    await logActivity(
      req,
      "REPLY_MESSAGE",
      `Replied to message from ${originalMessage.customerName}`,
    );
    if (originalMessage.travellerId) {
      await createNotification(
        currentAgent.companyName,
        "message",
        "New Message from Agent",
        `${currentAgent.companyName} has responded to your message regarding "${originalMessage.subject || "Inquiry"}".`,
        reply.id,
        originalMessage.travellerId,
      );
    }
    res.status(201).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/public/message", async (req, res) => {
  try {
    const {
      companyName,
      customerName,
      customerEmail,
      subject,
      message,
      travellerId,
    } = req.body;
    const newMessage = await prisma.message.create({
      data: {
        companyName,
        customerName,
        customerEmail,
        subject,
        message,
        travellerId: travellerId || null,
        senderRole: "traveller",
      },
    });
    await createNotification(
      companyName,
      "message",
      "New Customer Inquiry",
      `${customerName} sent a new message regarding "${subject || "No Subject"}".`,
      newMessage.id,
    );
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── TRAVELLER SPECIFIC ───────────────────────────────────────────────────────
router.get("/traveller/analytics", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await prisma.booking.findMany({
      where: { travellerId: userId },
    });
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(now.getDate() - 90);

    const totalBookings = bookings.length;
    const totalSpent = bookings.reduce(
      (sum, b) => sum + parseFloat(b.totalAmount || 0),
      0,
    );
    const spentThisMonth = bookings
      .filter((b) => new Date(b.createdAt) >= firstDayOfMonth)
      .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);

    const dailyDataMap = {};
    bookings.forEach((b) => {
      if (new Date(b.createdAt) >= ninetyDaysAgo) {
        const dateKey = new Date(b.createdAt).toISOString().split("T")[0];
        dailyDataMap[dateKey] =
          (dailyDataMap[dateKey] || 0) + parseFloat(b.totalAmount || 0);
      }
    });
    const dailyRevenue = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      dailyRevenue.push({
        day: d.toISOString(),
        revenue: dailyDataMap[dateKey] || 0,
      });
    }

    const typeCounts = { hotel: 0, package: 0, guide: 0 };
    bookings.forEach((b) => {
      if (typeCounts[b.bookingType] !== undefined) typeCounts[b.bookingType]++;
    });

    const activeTripsRaw = await prisma.booking.findMany({
      where: {
        travellerId: userId,
        status: "confirmed",
        tripStatus: { not: "completed" },
        bookingType: { in: ["package", "trekking"] },
      },
      include: { listing: { select: { title: true } } },
    });
    const activeTrips = activeTripsRaw.map((b) => ({
      id: b.id,
      title: b.listing?.title || b.guestName,
      status: b.tripStatus,
      checklist: b.checklist || [],
    }));

    res.json({
      totalBookings,
      totalSpent,
      spentThisMonth,
      revenueDaily: dailyRevenue,
      allocationCounts: typeCounts,
      allocation: {
        hotel: totalBookings
          ? Math.round((typeCounts.hotel / totalBookings) * 100)
          : 0,
        package: totalBookings
          ? Math.round((typeCounts.package / totalBookings) * 100)
          : 0,
        guide: totalBookings
          ? Math.round((typeCounts.guide / totalBookings) * 100)
          : 0,
      },
      recentBookings: bookings.slice(0, 5),
      activeTrips,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/traveller/messages", authMiddleware, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { travellerId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    const threadsMap = {};
    messages.forEach((m) => {
      if (!threadsMap[m.companyName])
        threadsMap[m.companyName] = {
          companyName: m.companyName,
          lastMsg: m.message,
          time: m.createdAt,
          status: m.status,
          unreadCount: 0,
          messages: [],
        };
      if (m.status === "unread" && m.senderRole === "agent")
        threadsMap[m.companyName].unreadCount++;
      threadsMap[m.companyName].messages.push(m);
    });
    res.json(Object.values(threadsMap));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/traveller/messages", authMiddleware, async (req, res) => {
  try {
    const { companyName, message, subject } = req.body;
    const traveller = await prisma.hamroTraveller.findUnique({
      where: { id: req.user.id },
    });

    // look up the agent by companyName so we can set agentId
    const agent = await prisma.hamroAgent.findFirst({ where: { companyName } });

    const newMessage = await prisma.message.create({
      data: {
        companyName,
        travellerId: req.user.id,
        agentId: agent?.id || null,
        customerName: traveller.fullName,
        customerEmail: traveller.email,
        subject: subject || "Direct Message",
        message,
        senderRole: "traveller",
      },
    });
    await createNotification(
      companyName,
      "message",
      "New Message from Traveller",
      `${traveller.fullName} sent a message.`,
      newMessage.id,
    );
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put(
  "/traveller/messages/read/:companyName",
  authMiddleware,
  async (req, res) => {
    try {
      await prisma.message.updateMany({
        where: {
          travellerId: req.user.id,
          companyName: req.params.companyName,
          senderRole: "agent",
          status: "unread",
        },
        data: { status: "read" },
      });
      res.json({ message: "Conversation marked as read" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

router.get("/traveller/reviews", authMiddleware, async (req, res) => {
  try {
    res.json(
      await prisma.review.findMany({
        where: { travellerId: req.user.id },
        orderBy: { createdAt: "desc" },
      }),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/traveller/history", authMiddleware, async (req, res) => {
  try {
    res.json(
      await prisma.activityLog.findMany({
        where: { travellerId: req.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PROFILE ──────────────────────────────────────────────────────────────────
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "agent")
      return res.status(403).json({ error: "Access denied" });
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const agent = await prisma.hamroAgent.findUnique({
      where: { id: effectiveId },
    });
    if (!agent)
      return res.status(404).json({ error: "Agent profile not found" });

    const ALLOWED_FIELDS = [
      "bio",
      "profileImage",
      "coverImage",
      "website",
      "socialLinks",
      "phoneNo",
      "fullName",
      "location",
      "companyName",
      "companyOwner",
      "ownerContactNo",
      "panNumber",
      "gender",
      "serviceTypes",
      "panImage",
      "citizenshipImage",
      "citizenshipNumber",
      "citizenshipDistrict",
      "citizenshipIssueDate",
      "verificationStatus",
    ];
    const update = {};
    ALLOWED_FIELDS.forEach((f) => {
      if (req.body[f] !== undefined) update[f] = req.body[f];
    });

    const oldCompanyName = agent.companyName;
    const newCompanyName = update.companyName;
    const companyNameChanged =
      newCompanyName && newCompanyName !== oldCompanyName;

    await prisma.$transaction(async (tx) => {
      await tx.hamroAgent.update({ where: { id: effectiveId }, data: update });
      if (companyNameChanged) {
        const cascadeWhere = { companyName: oldCompanyName };
        const cascadeData = { companyName: newCompanyName };
        await Promise.all([
          tx.listing.updateMany({ where: cascadeWhere, data: cascadeData }),
          tx.booking.updateMany({ where: cascadeWhere, data: cascadeData }),
          tx.review.updateMany({ where: cascadeWhere, data: cascadeData }),
          tx.message.updateMany({ where: cascadeWhere, data: cascadeData }),
          tx.guide.updateMany({ where: cascadeWhere, data: cascadeData }),
          tx.notification.updateMany({
            where: cascadeWhere,
            data: cascadeData,
          }),
          tx.activityLog.updateMany({ where: cascadeWhere, data: cascadeData }),
        ]);
      }
    });

    await logActivity(
      req,
      "UPDATE_PROFILE",
      companyNameChanged
        ? `Company name updated: "${oldCompanyName}" → "${newCompanyName}". All linked data cascaded.`
        : "Updated professional profile details",
    );

    const updated = await prisma.hamroAgent.findUnique({
      where: { id: req.user.id },
      omit: { password: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SUPER ADMIN ──────────────────────────────────────────────────────────────
router.get("/super/stats", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ error: "Unauthorized" });
    const { range } = req.query;
    const monthsToFetch = range === "12m" ? 12 : range === "6m" ? 6 : 3;
    const dateLimit = new Date();
    dateLimit.setMonth(dateLimit.getMonth() - monthsToFetch);

    const [
      totalAgents,
      verifiedAgents,
      pendingAgents,
      totalTravellers,
      revenueAgg,
      confirmedBookings,
    ] = await Promise.all([
      prisma.hamroAgent.count(),
      prisma.hamroAgent.count({ where: { verified: true } }),
      prisma.hamroAgent.count({ where: { verificationStatus: "pending" } }),
      prisma.hamroTraveller.count(),
      prisma.booking.aggregate({
        where: { status: "confirmed" },
        _sum: { totalAmount: true },
      }),
      prisma.booking.findMany({
        where: { status: "confirmed", createdAt: { gte: dateLimit } },
        select: { createdAt: true, totalAmount: true },
      }),
    ]);

    // Group by month
    const monthMap = {};
    confirmedBookings.forEach((b) => {
      const key = b.createdAt.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      monthMap[key] = (monthMap[key] || 0) + parseFloat(b.totalAmount || 0);
    });
    const revenueHistory = Object.entries(monthMap).map(([month, total]) => ({
      month,
      total,
    }));

    res.json({
      totalAgents,
      verifiedAgents,
      pendingAgents,
      totalTravellers,
      totalRevenue: parseFloat(revenueAgg._sum.totalAmount || 0),
      revenueHistory,
      userDistribution: [
        { label: "Verified Agencies", value: verifiedAgents, color: "#C5A059" },
        {
          label: "Standard Partners",
          value: totalAgents - verifiedAgents,
          color: "#0D1F18",
        },
        { label: "Active Explorers", value: totalTravellers, color: "#1D7447" },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/super/agents", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ error: "Unauthorized" });
    res.json(
      await prisma.hamroAgent.findMany({
        omit: { password: true },
        orderBy: { createdAt: "desc" },
      }),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/super/travellers", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ error: "Unauthorized" });
    res.json(
      await prisma.hamroTraveller.findMany({
        omit: { password: true },
        orderBy: { createdAt: "desc" },
      }),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/super/verify-agent/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ error: "Unauthorized" });
    const { status, verified } = req.body;
    const agent = await prisma.hamroAgent.findUnique({
      where: { id: req.params.id },
    });
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    const updated = await prisma.hamroAgent.update({
      where: { id: req.params.id },
      data: { verificationStatus: status, verified },
    });
    await createNotification(
      agent.companyName,
      "alert",
      verified ? "Agency Verified!" : "Verification Update",
      verified
        ? "Congratulations! Your agency has been verified. You now have the PRO badge."
        : `Your verification status has been updated to: ${status.toUpperCase()}.`,
      null,
      null,
      agent.id,
    );
    res.json({
      message: `Agent verification status updated to ${status}`,
      agent: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
