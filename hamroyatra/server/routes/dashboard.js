const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const HamroAgent = require("../models/Agent");
const Guide = require("../models/Guide");
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const ActivityLog = require("../models/ActivityLog");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const { sequelize } = require("../config/db");
const { Op, QueryTypes } = require("sequelize");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");

// Define association (safe to call multiple times — Sequelize deduplicates)
if (!Booking.associations.listing) {
  Booking.belongsTo(Listing, { foreignKey: "listingId", as: "listing" });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
  },
});

// Note: Models are synced in index.js or via migrations in a real app
// To avoid nodemon restart loops and ensure stability, we don't sync here.

// Helper to create notifications
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
    await Notification.create({
      companyName,
      type,
      title,
      message,
      targetId,
      travellerId,
      agentId,
    });
  } catch (err) {
    console.error("Notification Creation Failed:", err);
  }
};

router.get("/traveller/notifications", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { travellerId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 20,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resolves the "owner" agent ID for sub-agents.
// If the logged-in agent has a parentAgentId, all data belongs to the parent.
const getEffectiveAgentId = async (userId) => {
  const agent = await HamroAgent.findByPk(userId, {
    attributes: ["id", "parentAgentId"],
  });
  return agent && agent.parentAgentId ? agent.parentAgentId : userId;
};

// Helper to log activities (for Agents)
const logActivity = async (req, action, details, targetId = null) => {
  try {
    if (req.user.role !== "agent") return;
    const agent = await HamroAgent.findByPk(req.user.id);
    await ActivityLog.create({
      agentId: req.user.id,
      agentName: agent.fullName,
      companyName: agent.companyName,
      action,
      details,
      targetId,
    });
  } catch (err) {
    console.error("Activity Logging Failed:", err);
  }
};

// Helper to log activities (for Travellers)
const logTravellerActivity = async (req, action, details, targetId = null) => {
  try {
    if (req.user.role !== "traveller") return;
    const Traveller = require("../models/Traveller");
    const traveller = await Traveller.findByPk(req.user.id);
    await ActivityLog.create({
      travellerId: req.user.id,
      travellerName: traveller.fullName,
      action,
      details,
      targetId,
    });
  } catch (err) {
    console.error("Traveller Activity Logging Failed:", err);
  }
};

// ─── UPLOADS ─────────────────────────────────────────────
router.post("/upload", authMiddleware, upload.single("image"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const url = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── LISTINGS ─────────────────────────────────────────────

// Get all listings for the agent
router.get("/listings", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "superadmin") {
      const listings = await Listing.findAll({
        order: [["createdAt", "DESC"]],
      });
      return res.json(listings);
    }
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const listings = await Listing.findAll({
      where: { agentId: effectiveId },
      order: [["createdAt", "DESC"]],
    });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create listing
router.post("/listings", authMiddleware, async (req, res) => {
  try {
    const currentAgent = await HamroAgent.findByPk(req.user.id);
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
    const listing = await Listing.create({
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

// Update listing
router.put("/listings/:id", authMiddleware, async (req, res) => {
  try {
    console.log(`[UPDATE_LISTING] Attempting to update ID: ${req.params.id}`);
    let whereClause = { id: req.params.id };

    if (req.user.role !== "superadmin") {
      const effectiveId = await getEffectiveAgentId(req.user.id);
      whereClause.agentId = effectiveId;
    }

    const listing = await Listing.findOne({ where: whereClause });

    if (!listing) {
      return res
        .status(404)
        .json({ error: "Listing not found or unauthorized" });
    }

    const { id, agentId, companyName, ...updateData } = req.body;
    await listing.update(updateData);
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

// Delete listing
router.delete("/listings/:id", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const listing = await Listing.findOne({
      where: { id: req.params.id, agentId: effectiveId },
    });
    if (!listing)
      return res
        .status(404)
        .json({ error: "Listing not found or unauthorized" });
    const title = listing.title;
    await listing.destroy();
    await logActivity(req, "DELETE_LISTING", `Deleted listing: "${title}"`);
    res.json({ message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── BOOKINGS ─────────────────────────────────────────────

// Get all bookings for agent
router.get("/bookings", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const bookings = await Booking.findAll({
      where: { agentId: effectiveId },
      order: [["createdAt", "DESC"]],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bookings for logged in traveller
router.get("/traveller/bookings", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { travellerId: req.user.id },
      include: [
        {
          model: Listing,
          as: "listing",
          attributes: ["title", "price", "duration"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    // Flatten listing price/duration into each booking object for the frontend
    const result = bookings.map((b) => {
      const obj = b.toJSON();
      obj.title = obj.listing ? obj.listing.title : null;
      obj.listingPrice = obj.listing ? parseFloat(obj.listing.price) : null;
      obj.listingDuration = obj.listing ? obj.listing.duration : null;
      delete obj.listing;
      return obj;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bookings for a specific date range (calendar view)
router.get("/bookings/calendar", authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.query;
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const bookings = await Booking.findAll({
      where: {
        agentId: effectiveId,
        startDate: { [Op.between]: [startOfMonth, endOfMonth] },
      },
      order: [["startDate", "ASC"]],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create booking
router.post("/bookings", authMiddleware, async (req, res) => {
  try {
    const { bookingType, listingId } = req.body;
    let finalAgentId = null;
    let finalCompanyName = null;
    let finalStatus = "confirmed";

    if (req.user.role === "agent") {
      const currentAgent = await HamroAgent.findByPk(req.user.id);
      if (!currentAgent)
        return res.status(404).json({ error: "Agent profile not found" });
      finalAgentId = req.user.id;
      finalCompanyName = currentAgent.companyName;
    } else {
      // Traveller booking from public explore page
      const listing = await Listing.findByPk(listingId);
      if (!listing)
        return res.status(404).json({ error: "Listing not found for booking" });
      finalAgentId = listing.agentId;
      finalCompanyName = listing.companyName;
      finalStatus = "pending";
    }

    // Generate Serial ID (HO01, GD01, PG01...)
    const prefix =
      bookingType === "room" ? "HO" : bookingType === "guide" ? "GD" : "PG";
    const count = await Booking.count({
      where: { bookingType, companyName: finalCompanyName },
    });
    const serialId = `${prefix}${String(count + 1).padStart(2, "0")}`;

    const booking = await Booking.create({
      listingId: req.body.listingId || null,
      bookingType: req.body.bookingType,
      startDate: req.body.startDate,
      endDate: req.body.endDate || null,
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

    // Trigger Notification for the Agent/Company
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

// Start a trip (initialize checklist from listing itinerary)
// NOTE: Must be defined BEFORE PUT /bookings/:id to avoid route shadowing
router.put("/bookings/:id/start-trip", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, travellerId: req.user.id },
      include: [{ model: Listing, as: "listing", attributes: ["itinerary"] }],
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    const currentTripStatus = booking.tripStatus || "pending";
    if (currentTripStatus !== "pending")
      return res
        .status(400)
        .json({ error: "Trip already started or completed" });

    // Initialize checklist from listing itinerary
    let checklist = [];
    if (booking.listing && booking.listing.itinerary) {
      checklist = booking.listing.itinerary.map((day, idx) => ({
        id: idx,
        title: day.title || `Day ${idx + 1}`,
        location: day.location || "",
        completed: false,
        review: "",
        reviewEdited: false,
        completedAt: null,
      }));
    }

    await booking.update({
      tripStatus: "active",
      checklist: checklist,
    });

    res.json({ message: "Trip started successfully", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update checklist item
// NOTE: Must be defined BEFORE PUT /bookings/:id to avoid route shadowing
router.put(
  "/bookings/:id/checklist/update",
  authMiddleware,
  async (req, res) => {
    try {
      const { itemId, completed, review } = req.body;
      const booking = await Booking.findOne({
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

      await booking.update({ checklist });
      res.json({ message: "Progress updated", booking });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Update booking
router.put("/bookings/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let booking;
    if (userRole === "agent") {
      const effectiveId = await getEffectiveAgentId(userId);
      booking = await Booking.findOne({
        where: { id: req.params.id, agentId: effectiveId },
      });
    } else {
      booking = await Booking.findOne({
        where: { id: req.params.id, travellerId: userId },
      });
    }

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Explicit whitelist — only allow known safe fields to be updated
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

    const oldStatus = booking.status;
    await booking.update(update);

    // If status changed by agent, notify the traveller
    if (
      userRole === "agent" &&
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

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete booking
router.delete("/bookings/:id", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const booking = await Booking.findOne({
      where: { id: req.params.id, agentId: effectiveId },
    });
    if (!booking)
      return res
        .status(404)
        .json({ error: "Booking not found or unauthorized" });
    const guest = booking.guestName;
    await booking.destroy();
    await logActivity(
      req,
      "DELETE_BOOKING",
      `Deleted booking record for "${guest}"`,
    );
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── TEAM MANAGEMENT ─────────────────────────────────────

// Get all team members (Agents & Guides) for the company
router.get("/team", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const currentAgent = await HamroAgent.findByPk(effectiveId);
    if (!currentAgent)
      return res.status(404).json({ error: "Agent profile not found" });

    // Fetch all agents that belong to this company (owner + all sub-agents)
    const agents = await HamroAgent.findAll({
      where: {
        [Op.or]: [{ id: effectiveId }, { parentAgentId: effectiveId }],
      },
      attributes: { exclude: ["password"] },
    });

    // Guides are linked to the owner agent
    const guides = await Guide.findAll({
      where: { agentId: effectiveId },
      order: [["createdAt", "DESC"]],
    });

    res.json({ agents, guides });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new Agent to the team
router.post("/team/agent/send-otp", authMiddleware, async (req, res) => {
  // Sends OTP to the CURRENT (requesting) agent's email to confirm they authorized this action
  try {
    const currentAgent = await HamroAgent.findByPk(req.user.id);
    if (!currentAgent)
      return res.status(404).json({ error: "Agent not found" });

    const { sendOTP } = require("../services/otpService");
    await sendOTP(currentAgent.email, "team-invite");
    res.json({ message: `OTP sent to ${currentAgent.email}` });
  } catch (err) {
    console.error("Team OTP Error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Add a new Agent to the team
router.post("/team/agent", authMiddleware, async (req, res) => {
  try {
    const { fullName, email, password, phoneNo, otp } = req.body;
    const currentAgent = await HamroAgent.findByPk(req.user.id);

    // Verify the requesting agent confirmed with OTP
    const { verifyOTP, clearOTP } = require("../services/otpService");
    const otpCheck = verifyOTP(currentAgent.email, otp);
    if (!otpCheck.valid)
      return res
        .status(403)
        .json({ error: `OTP check failed: ${otpCheck.reason}` });

    // Verify email uniqueness across all users
    const existingAgent = await HamroAgent.findOne({ where: { email } });
    if (existingAgent)
      return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const effectiveParentId = currentAgent.parentAgentId || currentAgent.id;

    const newAgent = await HamroAgent.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNo,
      companyName: currentAgent.companyName,
      role: "agent",
      parentAgentId: effectiveParentId,
    });

    clearOTP(currentAgent.email); // Consume OTP

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
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        error:
          "Self-deletion is not permitted. Please contact administration for account closure.",
      });
    }

    const currentAgent = await HamroAgent.findByPk(req.user.id);
    const targetAgent = await HamroAgent.findOne({
      where: { id: req.params.id, companyName: currentAgent.companyName },
    });

    if (!targetAgent)
      return res
        .status(404)
        .json({ error: "Agent not found in your organization" });

    const name = targetAgent.fullName;
    await targetAgent.destroy();
    await logActivity(
      req,
      "DELETE_AGENT",
      `Removed agent "${name}" from company`,
    );
    res.json({ message: "Agent removed from company" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an existing Agent
router.put("/team/agent/:id", authMiddleware, async (req, res) => {
  try {
    const { fullName, email, phoneNo } = req.body;
    const agent = await HamroAgent.findByPk(req.params.id);
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    // Ensure they belong to the same company
    const currentAgent = await HamroAgent.findByPk(req.user.id);
    if (agent.companyName !== currentAgent.companyName) {
      return res.status(403).json({ error: "Unauthorized company mismatch" });
    }

    await agent.update({ fullName, email, phoneNo });
    await logActivity(
      req,
      "UPDATE_TEAM",
      `Updated credentials for agent: ${fullName}`,
      agent.id,
    );
    res.json({ message: "Agent updated successfully", agent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new Guide to the team
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
    const currentAgent = await HamroAgent.findByPk(req.user.id);

    if (!currentAgent.verified) {
      return res.status(403).json({
        error:
          'Badge Verification Required. Only verified agencies with a "PRO" badge can register and display professional guides on their profile. Please complete your partner verification first.',
      });
    }

    const newGuide = await Guide.create({
      fullName,
      email,
      phoneNo,
      experienceYears,
      profileImage,
      certificateImage,
      certificateExpiry,
      agentId: req.user.id,
      companyName: currentAgent.companyName,
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
    const guide = await Guide.findOne({
      where: { id: req.params.id, agentId: req.user.id },
    });
    if (!guide) return res.status(404).json({ error: "Guide not found" });
    const name = guide.fullName;
    await guide.destroy();
    await logActivity(
      req,
      "DELETE_GUIDE",
      `Removed guide "${name}" from company`,
    );
    res.json({ message: "Guide removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an existing Guide
router.put("/team/guide/:id", authMiddleware, async (req, res) => {
  try {
    const guide = await Guide.findOne({
      where: { id: req.params.id, agentId: req.user.id },
    });
    if (!guide) return res.status(404).json({ error: "Guide not found" });

    await guide.update(req.body);
    await logActivity(
      req,
      "UPDATE_GUIDE",
      `Updated field profile for guide: ${req.body.fullName}`,
      guide.id,
    );
    res.json({ message: "Guide updated successfully", guide });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ANALYTICS ─────────────────────────────────────────────

router.get("/analytics", authMiddleware, async (req, res) => {
  try {
    const agentId = await getEffectiveAgentId(req.user.id);
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Total revenue (3 months - Daily)
    const revenueResult = await Booking.findAll({
      where: {
        agentId,
        status: { [Op.ne]: "cancelled" },
        createdAt: { [Op.gte]: threeMonthsAgo },
      },
      attributes: [
        [sequelize.fn("date_trunc", "day", sequelize.col("createdAt")), "day"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "revenue"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: [sequelize.fn("date_trunc", "day", sequelize.col("createdAt"))],
      order: [
        [sequelize.fn("date_trunc", "day", sequelize.col("createdAt")), "ASC"],
      ],
    });

    // Total bookings by type
    const bookingsByType = await Booking.findAll({
      where: { agentId, createdAt: { [Op.gte]: threeMonthsAgo } },
      attributes: [
        "bookingType",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "revenue"],
      ],
      group: ["bookingType"],
    });

    // Total stats
    const totalBookings = await Booking.count({ where: { agentId } });
    const totalRevenue = await Booking.sum("totalAmount", {
      where: { agentId, status: { [Op.ne]: "cancelled" } },
    });
    const thisMonthRevenue = await Booking.sum("totalAmount", {
      where: {
        agentId,
        status: { [Op.ne]: "cancelled" },
        createdAt: { [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1) },
      },
    });

    // Recent bookings
    const recentBookings = await Booking.findAll({
      where: { agentId },
      order: [["createdAt", "DESC"]],
      limit: 8,
    });

    res.json({
      revenueDaily: revenueResult,
      bookingsByType,
      totalBookings,
      totalRevenue: totalRevenue || 0,
      thisMonthRevenue: thisMonthRevenue || 0,
      recentBookings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CUSTOMERS ─────────────────────────────────────────────

router.get("/customers", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const bookings = await Booking.findAll({
      where: { agentId: effectiveId },
      order: [["createdAt", "DESC"]],
    });

    const customersMap = new Map();

    for (const b of bookings) {
      const key = `${b.guestName.toLowerCase()}-${(b.guestEmail || "").toLowerCase()}`;
      if (!customersMap.has(key)) {
        customersMap.set(key, {
          name: b.guestName,
          email: b.guestEmail,
          phone: b.guestPhone,
          bookings: [],
        });
      }
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

// ─── HISTORY ─────────────────────────────────────────────

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const history = await ActivityLog.findAll({
      where: { agentId: effectiveId },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REVIEWS ─────────────────────────────────────────────

router.get("/reviews", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const agentListings = await Listing.findAll({
      where: { agentId: effectiveId },
      attributes: ["companyName"],
    });
    const companyNames = [
      ...new Set(agentListings.map((l) => l.companyName).filter(Boolean)),
    ];
    const agent = await HamroAgent.findByPk(effectiveId);
    if (agent.companyName && !companyNames.includes(agent.companyName))
      companyNames.push(agent.companyName);
    const reviews = await Review.findAll({
      where: {
        companyName: {
          [Op.in]: companyNames.length ? companyNames : ["__none__"],
        },
      },
      order: [["createdAt", "DESC"]],
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mock Public Review Submission (No auth for demo)
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
    const review = await Review.create({
      companyName,
      customerName,
      rating,
      message,
      serviceType,
      listingId,
      status: "pending",
    });

    // Trigger Notification
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

// ─── NOTIFICATIONS ─────────────────────────────────────────────

router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const notifications = await Notification.findAll({
      where: { agentId: effectiveId },
      order: [["createdAt", "DESC"]],
      limit: 20,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/notifications/mark-read", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    await Notification.update(
      { isRead: true },
      { where: { agentId: effectiveId, isRead: false } },
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── MESSAGES ─────────────────────────────────────────────

router.get("/messages", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const messages = await Message.findAll({
      where: { agentId: effectiveId },
      order: [["createdAt", "DESC"]],
    });

    // Group by email to form threads (latest message preview)
    const threadsMap = {};
    messages.forEach((m) => {
      const email = m.customerEmail;
      if (!threadsMap[email]) {
        threadsMap[email] = {
          ...m.toJSON(),
          unreadCount: 0,
        };
      }
      if (m.status === "unread" && m.senderRole === "traveller") {
        threadsMap[email].unreadCount++;
      }
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
      const messages = await Message.findAll({
        where: {
          agentId: effectiveId,
          customerEmail: req.params.email,
        },
        order: [["createdAt", "ASC"]],
      });
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

router.put("/messages/:id/read", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const message = await Message.findOne({
      where: { id: req.params.id, agentId: effectiveId },
    });
    if (!message) return res.status(404).json({ error: "Message not found" });

    await Message.update(
      { status: "read" },
      {
        where: {
          agentId: effectiveId,
          customerEmail: message.customerEmail,
          senderRole: "traveller",
          status: "unread",
        },
      },
    );

    res.json({ message: "Conversation marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/messages/:id/reply", authMiddleware, async (req, res) => {
  try {
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const currentAgent = await HamroAgent.findByPk(effectiveId);
    const originalMessage = await Message.findOne({
      where: { id: req.params.id, agentId: effectiveId },
    });
    if (!originalMessage)
      return res.status(404).json({ error: "Message not found" });

    const { message } = req.body;
    const reply = await Message.create({
      companyName: currentAgent.companyName,
      customerName: originalMessage.customerName,
      customerEmail: originalMessage.customerEmail,
      travellerId: originalMessage.travellerId,
      agentId: effectiveId,
      subject: `Re: ${originalMessage.subject}`,
      message,
      senderRole: "agent",
      status: "unread",
    });

    await Message.update(
      { status: "replied" },
      {
        where: {
          agentId: effectiveId,
          customerEmail: originalMessage.customerEmail,
          senderRole: "traveller",
        },
      },
    );

    await logActivity(
      req,
      "REPLY_MESSAGE",
      `Replied to message from ${originalMessage.customerName}`,
    );

    // Trigger Notification for the Traveller
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

// Public endpoint to send message (now links to user if authenticated)
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
    const newMessage = await Message.create({
      companyName,
      customerName,
      customerEmail,
      subject,
      message,
      travellerId: travellerId || null,
      senderRole: "traveller",
    });

    // Trigger Notification
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

// ─── TRAVELLER SPECIFIC DATA ────────────────────────────────

router.get("/traveller/analytics", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.findAll({ where: { travellerId: userId } });

    const totalBookings = bookings.length;
    const totalSpent = bookings.reduce(
      (sum, b) => sum + parseFloat(b.totalAmount || 0),
      0,
    );

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const spentThisMonth = bookings
      .filter((b) => new Date(b.createdAt) >= firstDayOfMonth)
      .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);

    // Daily revenue for the last 90 days (3 months)
    const dailyDataMap = {};
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(now.getDate() - 90);

    bookings.forEach((b) => {
      const date = new Date(b.createdAt);
      if (date >= ninetyDaysAgo) {
        const dateKey = date.toISOString().split("T")[0];
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

    const activeTripsRaw = await Booking.findAll({
      where: {
        travellerId: userId,
        status: "confirmed",
        tripStatus: { [Op.ne]: "completed" },
        bookingType: { [Op.in]: ["package", "trekking"] },
      },
      include: [{ model: Listing, as: "listing", attributes: ["title"] }],
    });
    const activeTrips = activeTripsRaw.map((b) => ({
      id: b.id,
      title: b.listing ? b.listing.title : b.guestName,
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
    const messages = await Message.findAll({
      where: { travellerId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    // Group messages by companyName to form "threads"
    const threadsMap = {};
    messages.forEach((m) => {
      if (!threadsMap[m.companyName]) {
        threadsMap[m.companyName] = {
          companyName: m.companyName,
          lastMsg: m.message,
          time: m.createdAt,
          status: m.status,
          unreadCount: 0,
          messages: [],
        };
      }
      if (m.status === "unread" && m.senderRole === "agent") {
        threadsMap[m.companyName].unreadCount++;
      }
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
    const Traveller = require("../models/Traveller");
    const traveller = await Traveller.findByPk(req.user.id);

    const newMessage = await Message.create({
      companyName,
      travellerId: req.user.id,
      customerName: traveller.fullName,
      customerEmail: traveller.email,
      subject: subject || "Direct Message",
      message,
      senderRole: "traveller",
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
      await Message.update(
        { status: "read" },
        {
          where: {
            travellerId: req.user.id,
            companyName: req.params.companyName,
            senderRole: "agent",
            status: "unread",
          },
        },
      );
      res.json({ message: "Conversation marked as read" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

router.get("/traveller/reviews", authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { travellerId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/traveller/history", authMiddleware, async (req, res) => {
  try {
    const history = await ActivityLog.findAll({
      where: { travellerId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Agent Profile (Self)
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "agent")
      return res.status(403).json({ error: "Access denied" });

    // Sub-agents update the parent's profile, not their own
    const effectiveId = await getEffectiveAgentId(req.user.id);
    const agent = await HamroAgent.findByPk(effectiveId);
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

    // Use a transaction so the cascade is atomic — either all succeed or none do
    await sequelize.transaction(async (t) => {
      await agent.update(update, { transaction: t });

      if (companyNameChanged) {
        // Cascade the rename to every related table that uses companyName as a soft-FK
        const cascadeWhere = {
          where: { companyName: oldCompanyName },
          transaction: t,
        };
        const cascadeUpdate = { companyName: newCompanyName };

        await Promise.all([
          Listing.update(cascadeUpdate, cascadeWhere),
          Booking.update(cascadeUpdate, cascadeWhere),
          Review.update(cascadeUpdate, cascadeWhere),
          Message.update(cascadeUpdate, cascadeWhere),
          Guide.update(cascadeUpdate, cascadeWhere),
          Notification.update(cascadeUpdate, cascadeWhere),
          ActivityLog.update(cascadeUpdate, cascadeWhere),
        ]);
      }
    });

    await logActivity(
      req,
      "UPDATE_PROFILE",
      companyNameChanged
        ? `Company name updated: "${oldCompanyName}" → "${newCompanyName}". All linked data cascaded.`
        : `Updated professional profile details`,
    );

    res.json(
      await HamroAgent.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
      }),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SUPER ADMIN ROUTES ─────────────────────────────────────

// Get platform stats for Super Admin
router.get("/super/stats", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ error: "Unauthorized" });

    const { range } = req.query;
    let monthsToFetch = 3;
    let bucketExpression;
    let labelFormat = "week";
    let stepInterval = "7 days";

    if (range === "6m") {
      monthsToFetch = 6;
      labelFormat = "biweekly";
      stepInterval = "15 days";
      bucketExpression = sequelize.literal(
        `date_trunc('month', "Booking"."createdAt") + (CASE WHEN extract(day from "Booking"."createdAt") <= 15 THEN 0 ELSE 15 END * interval '1 day')`,
      );
    } else if (range === "12m") {
      monthsToFetch = 12;
      labelFormat = "month";
      stepInterval = "1 month";
      bucketExpression = sequelize.fn(
        "date_trunc",
        "month",
        sequelize.col("Booking.createdAt"),
      );
    } else {
      monthsToFetch = 3;
      labelFormat = "week";
      stepInterval = "7 days";
      bucketExpression = sequelize.fn(
        "date_trunc",
        "week",
        sequelize.col("Booking.createdAt"),
      );
    }

    const dateLimit = new Date();
    dateLimit.setHours(0, 0, 0, 0);
    dateLimit.setMonth(dateLimit.getMonth() - monthsToFetch);

    // Fetch actual data
    const [
      totalAgents,
      verifiedAgents,
      pendingAgents,
      totalTravellers,
      totalRevenue,
      dbHistory,
    ] = await Promise.all([
      HamroAgent.count(),
      HamroAgent.count({ where: { verified: true } }),
      HamroAgent.count({ where: { verificationStatus: "pending" } }),
      require("../models/Traveller").count(),
      Booking.sum("totalAmount", { where: { status: "confirmed" } }),
      Booking.findAll({
        where: {
          status: "confirmed",
          createdAt: { [Op.gte]: dateLimit },
        },
        attributes: [
          [bucketExpression, "bucket"],
          [sequelize.fn("SUM", sequelize.col("totalAmount")), "total"],
        ],
        group: ["bucket"],
        order: [["bucket", "ASC"]],
      }),
    ]);

    // Create a map of existing data for quick lookup
    const dataMap = {};
    dbHistory.forEach((h) => {
      const bucketDate = new Date(h.get("bucket")).getTime();
      dataMap[bucketDate] = parseFloat(h.get("total"));
    });

    // Generate full sequence of buckets to ensure no gaps
    const processedHistory = [];
    let currentBucket = new Date(dateLimit);
    let counter = 1;

    while (currentBucket <= new Date()) {
      const bucketTime = currentBucket.getTime();
      let label = "";

      if (labelFormat === "week") {
        label = `W${counter}`;
      } else if (labelFormat === "biweekly") {
        const day = currentBucket.getDate();
        label = `${currentBucket.toLocaleDateString("en-US", { month: "short" })} ${day <= 15 ? "01" : "15"}`;
      } else {
        label = currentBucket.toLocaleDateString("en-US", { month: "short" });
      }

      processedHistory.push({
        month: label,
        total: dataMap[bucketTime] || 0,
      });

      // Increment bucket
      if (labelFormat === "week") {
        currentBucket.setDate(currentBucket.getDate() + 7);
      } else if (labelFormat === "biweekly") {
        if (currentBucket.getDate() <= 15) {
          currentBucket.setDate(16);
        } else {
          currentBucket.setMonth(currentBucket.getMonth() + 1);
          currentBucket.setDate(1);
        }
      } else {
        currentBucket.setMonth(currentBucket.getMonth() + 1);
      }
      counter++;
    }

    res.json({
      totalAgents,
      verifiedAgents,
      pendingAgents,
      totalTravellers,
      totalRevenue: totalRevenue || 0,
      revenueHistory: processedHistory,
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

// Get all agents for Super Admin
router.get("/super/agents", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ error: "Unauthorized" });
    const agents = await HamroAgent.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all travellers for Super Admin
router.get("/super/travellers", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ error: "Unauthorized" });
    const HamroTraveller = require("../models/Traveller");
    const travellers = await HamroTraveller.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });
    res.json(travellers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify/Reject Agent
router.put("/super/verify-agent/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ error: "Unauthorized" });
    const { status, verified } = req.body; // status: 'verified', 'rejected', 'pending'; verified: true/false

    const agent = await HamroAgent.findByPk(req.params.id);
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    await agent.update({
      verificationStatus: status,
      verified: verified, // This controls the "PRO" badge
    });

    // Create notification for the agent
    await createNotification(
      agent.companyName,
      "alert",
      verified ? "Agency Verified!" : "Verification Update",
      verified
        ? "Congratulations! Your agency has been verified. You now have the PRO badge and can manage professional guides."
        : `Your verification status has been updated to: ${status.toUpperCase()}.`,
      null,
      null,
      agent.id,
    );

    res.json({
      message: `Agent verification status updated to ${status}`,
      agent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
