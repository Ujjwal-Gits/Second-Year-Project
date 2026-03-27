// Auth routes: login, register, OTP flow, forgot password, session verify

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
const prisma = require("../config/prisma");

const otpRequestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req),
  message: { error: "Too many OTP requests. Please wait 5 minutes." },
});
const otpVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req),
  message: { error: "Too many attempts. Please wait 5 minutes." },
});
const resetPasswordLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req),
  message: { error: "Too many reset attempts. Please wait 5 minutes." },
});

router.post("/send-otp", otpRequestLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const existing =
      (await prisma.hamroTraveller.findUnique({ where: { email } })) ||
      (await prisma.hamroAgent.findUnique({ where: { email } }));
    if (existing)
      return res.status(400).json({ error: "Email already registered" });

    await sendOTP(email, "registration");
    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ error: "Failed to send OTP. Check SMTP config." });
  }
});

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

router.post(
  "/forgot-password/send-otp",
  otpRequestLimiter,
  async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email is required" });

      const user =
        (await prisma.hamroTraveller.findUnique({ where: { email } })) ||
        (await prisma.hamroAgent.findUnique({ where: { email } }));

      if (!user)
        return res.json({
          message: "If this email is registered, an OTP has been sent.",
        });

      try {
        await sendOTP(email, "password-reset");
      } catch (smtpErr) {
        return res
          .status(500)
          .json({ error: "Failed to send OTP email. Please try again." });
      }
      res.json({ message: "OTP sent to your email" });
    } catch (err) {
      res.status(500).json({ error: "Failed to send OTP." });
    }
  },
);

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
      if (!isOTPVerified(email))
        return res
          .status(403)
          .json({ error: "OTP not verified. Please start over." });

      const hashed = await bcrypt.hash(password, 12);

      const traveller = await prisma.hamroTraveller.findUnique({
        where: { email },
      });
      if (traveller) {
        await prisma.hamroTraveller.update({
          where: { email },
          data: { password: hashed },
        });
      } else {
        const agent = await prisma.hamroAgent.findUnique({ where: { email } });
        if (!agent) return res.status(404).json({ error: "Account not found" });
        await prisma.hamroAgent.update({
          where: { email },
          data: { password: hashed },
        });
      }

      clearOTP(email);
      res.json({ message: "Password reset successfully. You can now log in." });
    } catch (err) {
      console.error("Reset Password Error:", err);
      res.status(500).json({ error: "Failed to reset password." });
    }
  },
);

// exchanges a URL token (from Google OAuth redirect) for an HTTP-only cookie
router.post("/set-cookie", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token required" });

    const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);

    // fetch the real user to return full profile
    let user;
    if (decoded.role === "traveller") {
      user = await prisma.hamroTraveller.findUnique({ where: { id: decoded.id }, omit: { password: true } });
    } else if (decoded.role === "agent") {
      user = await prisma.hamroAgent.findUnique({ where: { id: decoded.id }, omit: { password: true } });
    }

    res.cookie("hv_token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.json({ ok: true, user: user || decoded });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

router.get("/verify", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "superadmin")

    let user;
    if (req.user.role === "agent") {
      user = await prisma.hamroAgent.findUnique({
        where: { id: req.user.id },
        omit: { password: true },
      });
    } else {
      user = await prisma.hamroTraveller.findUnique({
        where: { id: req.user.id },
        omit: { password: true },
      });
    }

    if (!user) return res.status(401).json({ valid: false });
    res.json({ valid: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
