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
const {
  sendOTP,
  verifyOTP,
  isOTPVerified,
  clearOTP,
} = require("../services/otpService");
const bcrypt = require("bcryptjs");

// Rate limiter: max 5 OTP requests per email per 5 minutes
const otpRequestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req),
  message: { error: "Too many OTP requests. Please wait 5 minutes." },
});

// Rate limiter: max 5 OTP verify attempts per 5 minutes
const otpVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req),
  message: { error: "Too many attempts. Please wait 5 minutes." },
});

// Rate limiter: max 5 password reset attempts per 5 minutes
const resetPasswordLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req),
  message: { error: "Too many reset attempts. Please wait 5 minutes." },
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

// ── Forgot Password: Step 1 — send OTP to registered email ───────────────────
router.post(
  "/forgot-password/send-otp",
  otpRequestLimiter,
  async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email is required" });

      const HamroTraveller = require("../models/Traveller");
      const HamroAgent = require("../models/Agent");
      const user =
        (await HamroTraveller.findOne({ where: { email } })) ||
        (await HamroAgent.findOne({ where: { email } }));

      // Always respond success to prevent email enumeration
      if (!user)
        return res.json({
          message: "If this email is registered, an OTP has been sent.",
        });

      // Google OAuth users can also reset — they'll get a real password set
      try {
        await sendOTP(email, "password-reset");
      } catch (smtpErr) {
        console.error("SMTP Error in forgot password:", smtpErr.message);
        return res
          .status(500)
          .json({ error: "Failed to send OTP email. Please try again." });
      }
      res.json({ message: "OTP sent to your email" });
    } catch (err) {
      console.error("Forgot Password OTP Error:", err);
      res.status(500).json({ error: "Failed to send OTP." });
    }
  },
);

// ── Forgot Password: Step 2 — verify OTP ─────────────────────────────────────
router.post(
  "/forgot-password/verify-otp",
  otpVerifyLimiter,
  async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp)
        return res.status(400).json({ error: "Email and OTP are required" });

      const result = verifyOTP(email, otp);
      if (!result.valid) return res.status(400).json({ error: result.reason });

      res.json({ message: "OTP verified. You may now reset your password." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// ── Forgot Password: Step 3 — reset password ─────────────────────────────────
router.post(
  "/forgot-password/reset",
  resetPasswordLimiter,
  async (req, res) => {
    try {
      const { email, password, confirmPassword } = req.body;
      if (!email || !password || !confirmPassword)
        return res.status(400).json({ error: "All fields are required" });

      if (password !== confirmPassword)
        return res.status(400).json({ error: "Passwords do not match" });

      if (password.length < 6)
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });

      // OTP must be verified before resetting
      if (!isOTPVerified(email))
        return res
          .status(403)
          .json({ error: "OTP not verified. Please start over." });

      const HamroTraveller = require("../models/Traveller");
      const HamroAgent = require("../models/Agent");

      const traveller = await HamroTraveller.findOne({ where: { email } });
      const agent = await HamroAgent.findOne({ where: { email } });
      const user = traveller || agent;

      if (!user) return res.status(404).json({ error: "Account not found" });

      const hashed = await bcrypt.hash(password, 12);
      user.password = hashed;
      await user.save();

      clearOTP(email);
      res.json({ message: "Password reset successfully. You can now log in." });
    } catch (err) {
      console.error("Reset Password Error:", err);
      res.status(500).json({ error: "Failed to reset password." });
    }
  },
);

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
