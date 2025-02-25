import express from 'express';
import passport from "passport";
import { signinUser, signupUser, googleSignIn } from '../controllers/authController.js';

const router = express.Router();

// ➤ Traditional Auth Routes
router.post("/sign-up", signupUser);
router.post("/sign-in", signinUser);

// ➤ Google Auth Redirect (Passport Flow)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// ➤ Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/sign-in" }),
  (req, res) => {
    // On success, redirect to frontend with user info
    res.redirect("http://localhost:5173/dashboard");
  }
);

// ➤ Google Token Login (react-oauth/google)
router.post("/google", googleSignIn);

// ➤ Logout Route (Optional)
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Logout failed");
    res.redirect("http://localhost:5173/sign-in");
  });
});

export default router;
