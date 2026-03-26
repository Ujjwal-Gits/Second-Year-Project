// OTP service — generates, stores, and verifies 6-digit codes sent via Resend
// OTPs expire after 10 minutes and are kept in memory (Map)

const crypto = require("crypto");
const { Resend } = require("resend");

// { email -> { otp, expiresAt, verified } }
const otpStore = new Map();

// lazy init so a missing env var doesn't crash on startup
let resendClient = null;
const getResend = () => {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
};

// crypto-secure 6-digit OTP
const generateOTP = () => {
  const bytes = crypto.randomBytes(3);
  const num = bytes.readUIntBE(0, 3) % 1000000;
  return String(num).padStart(6, "0");
};

// send OTP and store it in memory
const sendOTP = async (email, purpose = "registration") => {
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  otpStore.set(email, { otp, expiresAt, verified: false });

  const subject =
    purpose === "team-invite"
      ? "HamroYatra — Team Member Invitation OTP"
      : purpose === "password-reset"
        ? "HamroYatra — Password Reset OTP"
        : "HamroYatra — Verify Your Email";

  const bodyText =
    purpose === "team-invite"
      ? `You are being added as a team member on HamroYatra.`
      : purpose === "password-reset"
        ? `Your HamroYatra password reset OTP is:`
        : `Your HamroYatra registration OTP is:`;

  const { error } = await getResend().emails.send({
    from: "HamroYatra <noreply@ujjwalrupakheti.com.np>",
    to: email,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#1D7447;margin-bottom:8px;">HamroYatra</h2>
        <p style="color:#555;font-size:14px;">${bodyText}</p>
        <div style="font-size:36px;font-weight:900;letter-spacing:12px;color:#0D1F18;margin:24px 0;text-align:center;">${otp}</div>
        <p style="color:#aaa;font-size:12px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message || "Failed to send email");
  }

  return true;
};

// marks as verified on success
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
  otpStore.set(email, { ...record, verified: true });
  return { valid: true };
};

// returns true only if OTP was verified and hasn't expired yet
const isOTPVerified = (email) => {
  const record = otpStore.get(email);
  return record && record.verified === true && Date.now() <= record.expiresAt;
};

// call this after account creation so the OTP can't be reused
const clearOTP = (email) => {
  otpStore.delete(email);
};

module.exports = { sendOTP, verifyOTP, isOTPVerified, clearOTP };
