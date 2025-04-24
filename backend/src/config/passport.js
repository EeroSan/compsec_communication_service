import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

// Serialize user (stores user ID in session/cookie)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user (retrieves full user info)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (user.rows.length === 0) return done(null, false);
    done(null, user.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

// **Google OAuth Strategy**
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, emails } = profile;
        const email = emails[0].value;

        // Check if user exists
        let user = await pool.query("SELECT * FROM users WHERE oauth_provider = 'google' AND oauth_id = $1", [id]);

        if (user.rows.length === 0) {
          // Insert new user
          user = await pool.query(
            "INSERT INTO users (email, oauth_provider, oauth_id) VALUES ($1, 'google', $2) RETURNING *",
            [email, id]
          );
        }

        return done(null, user.rows[0]);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// **GitHub OAuth Strategy**
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, emails } = profile;
        const email = emails[0].value;

        // Check if user exists
        let user = await pool.query("SELECT * FROM users WHERE oauth_provider = 'github' AND oauth_id = $1", [id]);

        if (user.rows.length === 0) {
          // Insert new user
          user = await pool.query(
            "INSERT INTO users (email, oauth_provider, oauth_id) VALUES ($1, 'github', $2) RETURNING *",
            [email, id]
          );
        }

        return done(null, user.rows[0]);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
