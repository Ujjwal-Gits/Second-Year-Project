// This file handles all authentication logic: register traveller, register agent, login, and logout.
// Passwords are hashed with bcrypt. A JWT token is issued on success and stored as an HTTP-only cookie.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HamroTraveller = require("../models/Traveller");
const HamroAgent = require("../models/Agent");
const { isOTPVerified, clearOTP } = require("../services/otpService");

// Helper to generate token
const generateToken = (user, type) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, type: type },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );
};

const sendToken = (user, type, statusCode, res, message) => {
  const token = generateToken(user, type);
  const options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };
  res
    .status(statusCode)
    .cookie("hv_token", token, options)
    .json({
      message,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
};

exports.registerTraveller = async (req, res) => {
  try {
    const { fullName, email, password, contactNumber } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // OTP must be verified before account creation
    if (!isOTPVerified(email)) {
      return res.status(403).json({
        error: "Email OTP not verified. Please verify your email first.",
      });
    }

    const existingTraveller = await HamroTraveller.findOne({
      where: { email },
    });
    const existingAgent = await HamroAgent.findOne({ where: { email } });

    if (existingTraveller || existingAgent) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newTraveller = await HamroTraveller.create({
      fullName,
      email,
      password: hashedPassword,
      contactNumber,
      role: "traveller",
    });

    clearOTP(email); // Consume the OTP after successful registration
    sendToken(newTraveller, "traveller", 201, res, "Registration Successful");
  } catch (err) {
    console.error("Traveller Register Error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.registerAgent = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      location,
      phoneNo,
      companyName,
      companyOwner,
      ownerContactNo,
      panNumber,
      gender,
      serviceTypes,
      panImage,
      citizenshipImage,
      citizenshipNumber,
      citizenshipDistrict,
      citizenshipIssueDate,
    } = req.body;

    if (!email || !password || !fullName || !companyName) {
      return res
        .status(400)
        .json({ error: "All essential fields are required" });
    }

    // OTP must be verified before account creation
    if (!isOTPVerified(email)) {
      return res.status(403).json({
        error: "Email OTP not verified. Please verify your email first.",
      });
    }

    const existingTraveller = await HamroTraveller.findOne({
      where: { email },
    });
    const existingAgent = await HamroAgent.findOne({ where: { email } });

    if (existingTraveller || existingAgent) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newAgent = await HamroAgent.create({
      fullName,
      email,
      password: hashedPassword,
      location,
      phoneNo,
      companyName,
      role: "agent",
      companyOwner,
      ownerContactNo,
      panNumber,
      gender,
      serviceTypes,
      panImage,
      citizenshipImage,
      citizenshipNumber,
      citizenshipDistrict,
      citizenshipIssueDate,
    });

    clearOTP(email); // Consume the OTP after successful registration
    sendToken(newAgent, "agent", 201, res, "Agent Registration Successful");
  } catch (err) {
    console.error("Agent Register Error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASS
    ) {
      const adminUser = {
        id: 0,
        email,
        fullName: "Super Admin",
        role: "superadmin",
      };
      return sendToken(
        adminUser,
        "superadmin",
        200,
        res,
        "Logged in Successfully",
      );
    }

    let user = await HamroTraveller.findOne({ where: { email } });
    let type = "traveller";

    if (!user) {
      user = await HamroAgent.findOne({ where: { email } });
      type = "agent";
    }

    if (!user) {
      return res.status(401).json({ error: "Wrong Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Wrong Password" });
    }

    sendToken(user, type, 200, res, "Logged in Successfully");
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login Service Unavailable" });
  }
};

exports.logout = (req, res) => {
  res.cookie("hv_token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ message: "Logged out successfully" });
};
