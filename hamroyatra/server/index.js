// This is the main entry point of the HamroYatra backend server.
// It sets up Express, connects to the database, registers all API routes,
// and starts listening for requests. It also runs the guide license watcher on startup.

const { sequelize, connectDB } = require("./config/db");
const setupAssociations = require("./models/associations");
setupAssociations(); // Set up all model relationships before anything else
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
const checkLicenseExpiries = require("./services/licenseWatcher"); // Guide license watcher

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from the frontend dev servers and production domain
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://hamroyatra.ujjwalrupakheti.com.np",
      "https://second-year-project-kw9ta9y1r-ujjwal-gits-projects.vercel.app",
    ],
    credentials: true, // needed for cookies (JWT)
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize()); // Initialize passport (needed for Google OAuth)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Log every incoming request for debugging
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Register all API route groups
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes); // Google OAuth routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/plan", planRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Hamroyatra API is running", status: "OK" });
});

// Catch any route that doesn't exist
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.url}`);
  res.status(404).json({ error: `Endpoint not found: ${req.url}` });
});

// Catch any unhandled server errors
app.use((err, req, res, next) => {
  console.error("Server Error Stack:", err.stack);
  console.error("Server Error Message:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    details: err.message,
  });
});

// Connect DB, sync models, then start the server
const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: true }); // Auto-update DB schema to match models
    console.log("Database synced...");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      // Check guide license expiries on startup and every 24 hours
      checkLicenseExpiries();
      setInterval(checkLicenseExpiries, 1000 * 60 * 60 * 24);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
