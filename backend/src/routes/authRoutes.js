import express from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
} from "../controllers/oauthController.js";
import passport from "passport";

import { deleteDevices } from "../controllers/deviceController.js";

const router = express.Router();

// Local Authentication
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", deleteDevices, logout);

// // Google OAuth
// router.get("/google", googleAuth);
// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   googleCallback
// );

// // GitHub OAuth
// router.get("/github", githubAuth);
// router.get(
//   "/github/callback",
//   passport.authenticate("github", { failureRedirect: "/login" }),
//   githubCallback
// );

export default router;
