import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import errorRoutes from "./src/routes/errorRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import deviceRoutes from "./src/routes/deviceRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Parse JSON requests

// Rate limiter to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // time window in milliseconds (5 minutes)
  max: 15, // Limit
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/device", deviceRoutes);
app.use("*", errorRoutes);

console.log("process.env.POSTGRES_DB", process.env.POSTGRES_DB);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
