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
    res.redirect(process.env.FRONTEND_URL + "/overview");
  }
);

router.post("/google", googleSignIn);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session = null;

    res.redirect(process.env.FRONTEND_URL + "/sign-in");
  });
});


export default router;
