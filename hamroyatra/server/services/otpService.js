// This file manages OTP generation, storage, verification, and email delivery.
// OTPs are 6-digit, crypto-secure, expire in 10 minutes, and are stored in-memory.

const crypto = require("crypto");
const nodemailer = require("nodemailer");

// In-memory OTP store: key = email, value = { otp, expiresAt, verified }
const otpStore = new Map();

// ── Email transporter (Gmail SMTP) ────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS, // Gmail App Password (not your login password)
  },
});

// Generate a cryptographically secure 6-digit OTP
const generateOTP = () => {
  const bytes = crypto.randomBytes(3); // 3 bytes = 24 bits, enough for 6 digits
  const num = bytes.readUIntBE(0, 3) % 1000000;
  return String(num).padStart(6, "0");
};

// Send OTP email and store it
const sendOTP = async (email, purpose = "registration") => {
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(email, { otp, expiresAt, verified: false });

  const subject =
    purpose === "team-invite"
      ? "HamroYatra — Team Member Invitation OTP"
      : purpose === "password-reset"
        ? "HamroYatra — Password Reset OTP"
        : "HamroYatra — Verify Your Email";

  const bodyText =
    purpose === "team-invite"
      ? `You are being added as a team member on HamroYatra. Use this OTP to confirm: ${otp}`
      : purpose === "password-reset"
        ? `Your HamroYatra password reset OTP is: ${otp}`
        : `Your HamroYatra registration OTP is: ${otp}`;

  await transporter.sendMail({
    from: `"HamroYatra" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#1D7447;margin-bottom:8px;">HamroYatra</h2>
        <p style="color:#555;font-size:14px;">${bodyText.replace(otp, "")}</p>
        <div style="font-size:36px;font-weight:900;letter-spacing:12px;color:#0D1F18;margin:24px 0;text-align:center;">${otp}</div>
        <p style="color:#aaa;font-size:12px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });

  return true;
};

// Verify OTP — returns true/false, marks as verified on success
const verifyOTP = (email, inputOtp) => {
  const record = otpStore.get(email);
  if (!record) return { valid: false, reason: "No OTP found for this email" };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return { valid: false, reason: "OTP has expired" };
  }
  if (record.otp !== String(inputOtp).trim()) {
    return { valid: false, reason: "Incorrect OTP" };
  }
  // Mark as verified (consumed on registration)
  otpStore.set(email, { ...record, verified: true });
  return { valid: true };
};

// Check if email has a verified OTP (used before creating account)
const isOTPVerified = (email) => {
  const record = otpStore.get(email);
  return record && record.verified === true && Date.now() <= record.expiresAt;
};

// Clear OTP after account is created
const clearOTP = (email) => {
  otpStore.delete(email);
};

module.exports = { sendOTP, verifyOTP, isOTPVerified, clearOTP };
