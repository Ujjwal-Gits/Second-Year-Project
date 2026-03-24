// This file handles Google OAuth login using Passport.js.
// When a user clicks "Continue with Google", they are redirected to Google,
// then Google sends them back here. We find or create a Traveller account,
// issue a JWT cookie, and redirect them back to the frontend.

const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const HamroTraveller = require("../models/Traveller");
require("dotenv").config();

// ── Configure Google Strategy ─────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(
          "[GOOGLE_AUTH] Profile received:",
          profile.id,
          profile.displayName,
        );
        const email = profile.emails?.[0]?.value;
        const fullName = profile.displayName;
        const googleId = profile.id;

        // Check if traveller already exists by googleId or email
        let traveller = await HamroTraveller.findOne({ where: { googleId } });

        if (!traveller && email) {
          // Check if they registered with email/password before
          traveller = await HamroTraveller.findOne({ where: { email } });
          if (traveller) {
            // Link Google to existing account
            traveller.googleId = googleId;
            traveller.authProvider = "google";
            await traveller.save();
          }
        }

        if (!traveller) {
          // Create a brand new traveller account via Google
          traveller = await HamroTraveller.create({
            fullName,
            email,
            googleId,
            authProvider: "google",
            password: "google-oauth-no-password", // placeholder, never used
            role: "traveller",
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

// Passport session stubs — we use JWT so these are minimal
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, { id }));

// ── Step 1: Redirect user to Google ──────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// ── Step 2: Google redirects back here after login ───────────────────────────
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err) {
      console.error("Google OAuth Error:", err.message);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
    if (!user) {
      console.error("Google OAuth: No user returned");
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_user`);
    }

    // Issue JWT token (same format as email/password login)
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

    // Set cookie and redirect to frontend
    res.cookie("hv_token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.redirect(`${process.env.CLIENT_URL}/`);
  })(req, res, next);
});

module.exports = router;
