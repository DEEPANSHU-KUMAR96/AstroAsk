import { Router } from "express";

import rateLimit from "express-rate-limit";
import {
    register, verifyEmail, resendOTP,
    login, refresh, logout,
    forgotPassword, resetPassword,
    getMe, updateProfile, changePassword,
    googleAuth, googleCallback,
} from "../controllers/auth.controllers.js";
import { protect, requireVerified } from "../middlewares/auth.js";
import validate from "../middleware/validate.js";
import { body } from "express-validator";
import { registerRules, loginRules, otpRules, resetRules } from "../validators/auth.validator.js";

const router = Router();

// Strict limiter for auth mutation endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many requests. Try again in 15 minutes."
    },
});

// OTP endpoints — tighter limit
const otpLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many OTP requests. Wait 1 minute."
    },
});



// ── Public routes ────────────────────────────────────────────────
router.post("/register", authLimiter, registerRules, validate, register);
router.post("/verify-email", authLimiter, otpRules, validate, verifyEmail);
router.post("/resend-otp", otpLimiter, [body("email").isEmail().normalizeEmail()], validate, resendOTP);
router.post("/login", authLimiter, loginRules, validate, login);
router.post("/refresh", refresh);
router.post("/forgot-password", authLimiter, [body("email").isEmail().normalizeEmail()], validate, forgotPassword);
router.post("/reset-password", authLimiter, resetRules, validate, resetPassword);

// ── Google OAuth ─────────────────────────────────────────────────
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

// ── Protected routes ─────────────────────────────────────────────
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, requireVerified, [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 6 }),
], validate, changePassword);
router.post("/logout", protect, logout);

export default router;