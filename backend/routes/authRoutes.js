import express from 'express';
import passport from "passport";
import { signinUser, signupUser, googleSignIn } from '../controllers/authController.js';

const router = express.Router();

router.post("/sign-up", signupUser);
router.post("/sign-in", signinUser);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/sign-in" }),
  (req, res) => {
    res.redirect("http://localhost:5173/dashboard");
  }
);

router.post("/google", googleSignIn);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Logout failed");
    res.redirect("http://localhost:5173/sign-in");
  });
});

export default router;
