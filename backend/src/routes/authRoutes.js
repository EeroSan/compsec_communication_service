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

import {
  validateLoginCredentials,
  whitelistFields,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

// Local Authentication
router.post(
  "/signup",
  whitelistFields(["email", "password"]),
  validateLoginCredentials,
  signup
);
router.post(
  "/login",
  whitelistFields(["email", "password"]),
  validateLoginCredentials,
  login
);
router.post(
  "/refresh",
  whitelistFields(["email", "refreshToken"]),
  refreshToken
);
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
