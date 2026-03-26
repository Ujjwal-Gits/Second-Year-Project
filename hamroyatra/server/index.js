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

// one-time URL fix — remove after running once
app.get("/api/fix-image-urls", async (req, res) => {
  const prisma = require("./config/prisma");
  const OLD = "http://localhost:5000";
  const NEW = "https://second-year-project-heoc.onrender.com";
  const fix = (v) =>
    typeof v === "string" && v.startsWith(OLD) ? v.replace(OLD, NEW) : v;
  try {
    const agents = await prisma.hamroAgent.findMany();
    let ac = 0;
    for (const a of agents) {
      const d = {};
      if (fix(a.panImage) !== a.panImage) d.panImage = fix(a.panImage);
      if (fix(a.citizenshipImage) !== a.citizenshipImage)
        d.citizenshipImage = fix(a.citizenshipImage);
      if (fix(a.profileImage) !== a.profileImage)
        d.profileImage = fix(a.profileImage);
      if (fix(a.coverImage) !== a.coverImage) d.coverImage = fix(a.coverImage);
      if (Object.keys(d).length) {
        await prisma.hamroAgent.update({ where: { id: a.id }, data: d });
        ac++;
      }
    }
    const listings = await prisma.listing.findMany();
    let lc = 0;
    for (const l of listings) {
      const imgs = (l.images || []).map(fix);
      if (imgs.join() !== (l.images || []).join()) {
        await prisma.listing.update({
          where: { id: l.id },
          data: { images: imgs },
        });
        lc++;
      }
    }
    const guides = await prisma.guide.findMany();
    let gc = 0;
    for (const g of guides) {
      const d = {};
      if (fix(g.profileImage) !== g.profileImage)
        d.profileImage = fix(g.profileImage);
      if (fix(g.certificateImage) !== g.certificateImage)
        d.certificateImage = fix(g.certificateImage);
      if (Object.keys(d).length) {
        await prisma.guide.update({ where: { id: g.id }, data: d });
        gc++;
      }
    }
    res.json({ ok: true, agentsFixed: ac, listingsFixed: lc, guidesFixed: gc });
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
