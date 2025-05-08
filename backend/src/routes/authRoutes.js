import express from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
} from "../controllers/authController.js";

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

export default router;
