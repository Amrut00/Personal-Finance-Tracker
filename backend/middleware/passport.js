import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../database/mongo-schema.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // ✅ Ensure this is correct
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          // User exists, return their data
          return done(null, existingUser);
        }

        // Create new user if they don't exist
        const newUser = new User({
          firstname: profile.name.givenName,
          lastname: profile.name.familyName || "", // Some users don't have a last name
          email: profile.emails[0].value,
          googleId: profile.id,
          googleToken: accessToken
        });
        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
