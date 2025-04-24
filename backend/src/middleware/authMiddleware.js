import jwt from "jsonwebtoken";
import dotenv from "dotenv";
//import pool from "../config/db.js";

dotenv.config();

// **Verify Access Token Middleware**
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
  const  email = req.body.email;
  if (!token) return res.status(401).json({ message: "Access token required" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (decoded.email !== email) {
        console.log("credentials doesnt match in protect middleware");
        console.log("decoded", decoded);
        console.log("email", email);
      return res.status(403).json({ message: "Invalid access token for this user." });
    }
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
