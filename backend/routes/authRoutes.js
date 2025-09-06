import express from 'express';
import passport from "passport";
import { signinUser, signupUser, googleSignIn } from '../controllers/authController.js';

const router = express.Router();

router.post("/sign-up", signupUser);
router.post("/sign-in", signinUser);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: process.env.FRONTEND_URL + "/sign-in" }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL + "/dashboard");
  }
);

router.post("/google", googleSignIn);

router.get("/logout", (req, res) => {
  try {
    // Clear the auth token from headers
    res.clearCookie('token');
    
    // Return success response
    res.status(200).json({
      status: "success",
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({
      status: "failed",
      message: "Logout failed"
    });
  }
});


export default router;
