import express from "express";
import {
  registerDevice,
  getConnectionInfo,
} from "../controllers/deviceController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", authenticateToken, registerDevice);
router.post("/connection-info", authenticateToken, getConnectionInfo);

export default router;
