import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import { config } from "./config.js";

export function configurePassport() {
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) return;

  passport.use(new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error("Google account has no email address"));

        const user = await User.findOneAndUpdate(
          { $or: [{ googleId: profile.id }, { email }] },
          {
            $set: {
              googleId: profile.id,
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value,
              authProvider: "google",
              isVerified: true,
            },
            $setOnInsert: { email },
          },
          { returnDocument: "after", upsert: true, runValidators: true },
        );
        done(null, user);
      } catch (error) {
        done(error);
      }
    },
  ));
}