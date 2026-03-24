// This middleware protects routes that require a logged-in user.
// It reads the JWT token from the cookie (or Authorization header),
// verifies it, and attaches the decoded user info to req.user.

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Check for token in cookie first, then header
  const token =
    req.cookies.hv_token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

module.exports = authMiddleware;
