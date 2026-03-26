// JWT auth middleware — reads hv_token from cookie or Authorization header,
// verifies it, and puts the decoded user on req.user

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // cookie first, then header fallback
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
