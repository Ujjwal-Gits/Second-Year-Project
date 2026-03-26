// Server entry point

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const passport = require("passport");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const publicRoutes = require("./routes/public");
const agentRoutes = require("./routes/agent");
const planRoutes = require("./routes/plan");
const googleAuthRoutes = require("./routes/googleAuth");
const checkLicenseExpiries = require("./services/licenseWatcher");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://hamroyatra.ujjwalrupakheti.com.np",
      "https://second-year-project-kw9ta9y1r-ujjwal-gits-projects.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/plan", planRoutes);

app.get("/", (req, res) =>
  res.json({ message: "Hamroyatra API is running", status: "OK" }),
);

// debug — remove after checking
app.get("/api/debug/agents", async (req, res) => {
  const prisma = require("./config/prisma");
  const agents = await prisma.hamroAgent.findMany({
    select: {
      id: true,
      email: true,
      companyName: true,
      verified: true,
      verificationStatus: true,
      serviceTypes: true,
      parentAgentId: true,
    },
  });
  res.json(agents);
});

// one-time demo seed — POST so it only runs when deliberately called
// call: POST https://second-year-project-heoc.onrender.com/api/seed-demo
app.post("/api/seed-demo", async (req, res) => {
  const prisma = require("./config/prisma");
  const bcrypt = require("bcryptjs");
  try {
    const hashed = await bcrypt.hash("12345678", 12);
    const traveller = await prisma.hamroTraveller.upsert({
      where: { email: "traveller@test.com" },
      update: { password: hashed },
      create: {
        fullName: "Demo Traveller",
        email: "traveller@test.com",
        password: hashed,
        role: "traveller",
      },
    });
    const agent = await prisma.hamroAgent.upsert({
      where: { email: "agent@test.com" },
      update: { password: hashed },
      create: {
        fullName: "Demo Agent",
        email: "agent@test.com",
        password: hashed,
        role: "agent",
        companyName: "Demo Agency",
        verificationStatus: "pending",
        serviceTypes: ["trekking", "travel"],
      },
    });
    res.json({ ok: true, traveller: traveller.email, agent: agent.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.url}` });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res
    .status(500)
    .json({ error: "Internal Server Error", details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  checkLicenseExpiries();
  setInterval(checkLicenseExpiries, 1000 * 60 * 60 * 24);
});
