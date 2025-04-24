import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
};

// **Google OAuth Initiation**
export const googleAuth = (req, res, next) => {
  next(); // Let Passport.js handle the request
};

// **Google OAuth Callback**
export const googleCallback = (req, res) => {
  const token = generateToken(req.user);
  res.json({ message: "Google authentication successful", token });
};

// **GitHub OAuth Initiation**
export const githubAuth = (req, res, next) => {
  next(); // Let Passport.js handle the request
};

// **GitHub OAuth Callback**
export const githubCallback = (req, res) => {
  const token = generateToken(req.user);
  res.json({ message: "GitHub authentication successful", token });
};
