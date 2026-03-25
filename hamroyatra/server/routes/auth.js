// This file defines the auth routes: login, register (traveller & agent), logout, and session verify.
// The /verify route is used by the frontend on page load to check if the user is still logged in.

const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");
const {
  login,
  registerTraveller,
  registerAgent,
  logout,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { sendOTP, verifyOTP } = require("../services/otpService");

// Rate limiter: max 3 OTP requests per email per 15 minutes
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req),
  message: { error: "Too many OTP requests. Please wait 15 minutes." },
});

// Rate limiter: max 5 OTP verify attempts per 15 minutes
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req),
  message: { error: "Too many attempts. Please request a new OTP." },
});

// Send OTP to email before registration
router.post("/send-otp", otpRequestLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Check email not already registered
    const HamroTraveller = require("../models/Traveller");
    const HamroAgent = require("../models/Agent");
    const existing =
      (await HamroTraveller.findOne({ where: { email } })) ||
      (await HamroAgent.findOne({ where: { email } }));
    if (existing)
      return res.status(400).json({ error: "Email already registered" });

    await sendOTP(email, "registration");
    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ error: "Failed to send OTP. Check SMTP config." });
  }
});

// Verify OTP
router.post("/verify-otp", otpVerifyLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP are required" });

    const result = verifyOTP(email, otp);
    if (!result.valid) return res.status(400).json({ error: result.reason });

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", login);
router.post("/register/traveller", registerTraveller);
router.post("/register/agent", registerAgent);
router.get("/logout", logout);

// Protected Verify Route
router.get("/verify", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "superadmin") {
      return res.json({ valid: true, user: req.user });
    }

    let user;
    if (req.user.role === "agent") {
      const HamroAgent = require("../models/Agent");
      user = await HamroAgent.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
      });
    } else {
      const HamroTraveller = require("../models/Traveller");
      user = await HamroTraveller.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
      });
    }

    if (!user) return res.status(401).json({ valid: false });
    res.json({ valid: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
