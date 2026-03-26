// Google OAuth — finds or creates a traveller account, then issues a JWT cookie

const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const fullName = profile.displayName;
        const googleId = profile.id;

        let traveller = await prisma.hamroTraveller.findFirst({
          where: { googleId },
        });

        if (!traveller && email) {
          traveller = await prisma.hamroTraveller.findUnique({
            where: { email },
          });
          if (traveller) {
            traveller = await prisma.hamroTraveller.update({
              where: { email },
              data: { googleId, authProvider: "google" },
            });
          }
        }

        if (!traveller) {
          traveller = await prisma.hamroTraveller.create({
            data: {
              fullName,
              email,
              googleId,
              authProvider: "google",
              password: "google-oauth-no-password",
              role: "traveller",
            },
          });
        }

        return done(null, traveller);
      } catch (err) {
        console.error("[GOOGLE_AUTH] Strategy error:", err.message);
        return done(err, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, { id }));

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.cookie("hv_token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.redirect(`${process.env.CLIENT_URL}/`);
  })(req, res, next);
});

module.exports = router;
