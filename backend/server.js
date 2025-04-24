import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
// import { createServer } from "http";
// import { WebSocketServer } from "ws";
import authRoutes from "./src/routes/authRoutes.js";
import deviceRoutes from "./src/routes/deviceRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Security middlewares
//app.use(helmet()); // Security headers
//app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON requests
//app.use(express.urlencoded({ extended: true })); // Support form submissions

// Rate limiter to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Routes

// app.use("/", (req, res) => {
//   res.send("Hello, World!");
// });

app.use("/api/auth", authRoutes);
app.use("/api/device", deviceRoutes);


console.log("process.env.POSTGRES_DB", process.env.POSTGRES_DB);

if (process.env.NODE_ENV !== "test") {


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
}

// Create an HTTP server for WebSocket support
// const server = createServer(app);

// // Initialize WebSocket Server
// const wss = new WebSocketServer({ server });

// wss.on("connection", (ws) => {
//   console.log("New WebSocket connection established");

//   ws.on("message", (message) => {
//     console.log(`Received: ${message}`);
//     // Broadcast to all clients
//     wss.clients.forEach((client) => {
//       if (client.readyState === ws.OPEN) {
//         client.send(`Echo: ${message}`);
//       }
//     });
//   });

//   ws.on("close", () => console.log("WebSocket connection closed"));
// });

// // Start the server
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

export default app;