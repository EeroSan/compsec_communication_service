import express from "express";
import { handleInvalidEndpoint } from "../controllers/errorController.js";
const router = express.Router();

// Catch-all route for any undefined endpoints
router.all("*", handleInvalidEndpoint);

export default router;
