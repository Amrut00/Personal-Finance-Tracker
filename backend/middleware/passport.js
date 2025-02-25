import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { pool } from "../libs/database.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        const existingUser = await pool.query(
          `SELECT * FROM tbluser WHERE google_id = $1`,
          [profile.id]
        );

        if (existingUser.rows.length > 0) {
          return done(null, existingUser.rows[0]);
        }

        // If not, create new user
        const newUser = await pool.query(
          `INSERT INTO tbluser (google_id, firstname, lastname, email) VALUES ($1, $2, $3, $4) RETURNING *`,
          [
            profile.id,
            profile.name.givenName,
            profile.name.familyName,
            profile.emails[0].value,
          ]
        );

        return done(null, newUser.rows[0]);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await pool.query(`SELECT * FROM tbluser WHERE id = $1`, [id]);
    done(null, user.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
