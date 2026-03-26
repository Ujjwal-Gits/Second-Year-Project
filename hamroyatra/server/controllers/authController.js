// Handles register, login, and logout. Passwords hashed with bcrypt, auth via JWT cookie.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { isOTPVerified, clearOTP } = require("../services/otpService");

const generateToken = (user, type) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, type },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

const sendToken = (user, type, statusCode, res, message) => {
  const token = generateToken(user, type);
  res
    .status(statusCode)
    .cookie("hv_token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
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
    if (!email || !password || !fullName)
      return res.status(400).json({ error: "All fields are required" });

    if (!isOTPVerified(email))
      return res.status(403).json({
        error: "Email OTP not verified. Please verify your email first.",
      });

    const existing =
      (await prisma.hamroTraveller.findUnique({ where: { email } })) ||
      (await prisma.hamroAgent.findUnique({ where: { email } }));
    if (existing)
      return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newTraveller = await prisma.hamroTraveller.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        contactNumber,
        role: "traveller",
      },
    });

    clearOTP(email);
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

    if (!email || !password || !fullName || !companyName)
      return res
        .status(400)
        .json({ error: "All essential fields are required" });

    if (!isOTPVerified(email))
      return res.status(403).json({
        error: "Email OTP not verified. Please verify your email first.",
      });

    const existing =
      (await prisma.hamroTraveller.findUnique({ where: { email } })) ||
      (await prisma.hamroAgent.findUnique({ where: { email } }));
    if (existing)
      return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newAgent = await prisma.hamroAgent.create({
      data: {
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
      },
    });

    clearOTP(email);
    sendToken(newAgent, "agent", 201, res, "Agent Registration Successful");
  } catch (err) {
    console.error("Agent Register Error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASS
    ) {
      return sendToken(
        { id: 0, email, fullName: "Super Admin", role: "superadmin" },
        "superadmin",
        200,
        res,
        "Logged in Successfully",
      );
    }

    // demo accounts — no DB needed
    if (email === "traveller@test.com" && password === "12345678") {
      return sendToken(
        {
          id: "demo-traveller",
          email,
          fullName: "Demo Traveller",
          role: "traveller",
        },
        "traveller",
        200,
        res,
        "Logged in Successfully",
      );
    }
    if (email === "agent@test.com" && password === "12345678") {
      return sendToken(
        { id: "demo-agent", email, fullName: "Demo Agent", role: "agent" },
        "agent",
        200,
        res,
        "Logged in Successfully",
      );
    }

    let user = await prisma.hamroTraveller.findUnique({ where: { email } });
    let type = "traveller";
    if (!user) {
      user = await prisma.hamroAgent.findUnique({ where: { email } });
      type = "agent";
    }
    if (!user) return res.status(401).json({ error: "Wrong Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Wrong Password" });

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
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "Logged out successfully" });
};
