import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../config/db.js";

dotenv.config();

// === Helper Functions ===

const validateEmailAndPassword = (email, password) => !!email && !!password;

const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
};

const checkUserExists = async (email) => {
  const user = await findUserByEmail(email);
  return !!user;
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

const comparePasswords = (inputPassword, hash) => {
  return bcrypt.compare(inputPassword, hash);
};

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email };
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const verifyAccessToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or malformed authorization header");
  }
  const token = authHeader.split(" ")[1];
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

const storeRefreshToken = async (email, refreshToken) => {
  await pool.query(
    "INSERT INTO tokens (email, refresh_token) VALUES ($1, $2)",
    [email, refreshToken]
  );
};

// === Controllers ===

export const signup = async (req, res) => {
  const { email, password } = req.body;

  if (!validateEmailAndPassword(email, password)) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    if (await checkUserExists(email)) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashed = await hashPassword(password);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, hashed]
    );

    const user = result.rows[0];
    const { accessToken, refreshToken } = generateTokens(user);
    await storeRefreshToken(email, refreshToken);

    res
      .status(201)
      .json({
        message: "User created successfully",
        accessToken,
        refreshToken,
      });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!validateEmailAndPassword(email, password)) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || !(await comparePasswords(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await storeRefreshToken(email, refreshToken);

    res
      .status(200)
      .json({ message: "Login successful", accessToken, refreshToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const refreshToken = async (req, res) => {
  const { email, refreshToken } = req.body;

  if (!validateEmailAndPassword(email, refreshToken)) {
    return res
      .status(400)
      .json({ message: "Email and refresh token required." });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const result = await pool.query(
      "SELECT * FROM tokens WHERE email = $1 AND refresh_token = $2",
      [email, refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

export const logout = async (req, res) => {
  const { email } = req.body;

  try {
    const decoded = verifyAccessToken(req.headers["authorization"]);

    if (decoded.email !== email) {
      return res
        .status(403)
        .json({ message: "Invalid access token for this user." });
    }

    await pool.query("DELETE FROM tokens WHERE email = $1", [email]);
    res.json({ message: "Logged out from all devices" });
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
};


export const __test_helpers__ = {
  validateEmailAndPassword,
  hashPassword,
  comparePasswords,
  generateTokens,
  findUserByEmail,
  checkUserExists,
};