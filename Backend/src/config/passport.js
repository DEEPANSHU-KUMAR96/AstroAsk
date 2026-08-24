import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

export function configurePassport() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return;

  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
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
            $setOnInsert: { email, name: profile.displayName },
          },
          { new: true, upsert: true, runValidators: true },
        );
        done(null, user);
      } catch (error) {
        done(error);
      }
    },
  ));
}