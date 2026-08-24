import passport from "passport";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendTokens, signAccess, signRefresh, verifyRefresh } from "../utils/jwt.utils.js";
import { generateOTP, hashOTP, matchOTP, otpExpiry } from "../utils/otp.utils.js";
import {
    sendVerificationOTP,
    sendPasswordResetOTP,
    sendWelcome,
    sendPasswordChanged,
} from "../services/email.service.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const exists = await User.findOne({
        email
    });
    if (exists) {
        const msg = exists.authProvider === "google"
            ? "This email is registered via Google. Please sign in with Google."
            : "Email already in use.";
        throw new AppError(msg, 409);
    }

    const otp = generateOTP();
    const user = await User.create({
        name,
        email,
        password,
        verifyOTP: hashOTP(otp),
        verifyOTPExpiry: otpExpiry(10),
    });

    try {
        await sendVerificationOTP(user, otp);
    } catch (error) {
        await User.deleteOne({ _id: user._id });
        throw new AppError("Unable to send verification email. Please try again later.", 503);
    }

    res.status(201).json({
        success: true,
        message: `OTP sent to ${email}. Valid for 10 minutes.`,
    });
});

// POST /api/auth/verify-email
export const verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({
        email
    }).select("+verifyOTP +verifyOTPExpiry");
    if (!user) throw new AppError("User not found", 404);
    if (user.isVerified) throw new AppError("Email already verified", 400);
    if (!user.verifyOTPExpiry || user.verifyOTPExpiry < new Date())
        throw new AppError("OTP expired. Request a new one.", 400);
    if (!matchOTP(otp, user.verifyOTP))
        throw new AppError("Invalid OTP", 400);

    user.isVerified = true;
    user.verifyOTP = undefined;
    user.verifyOTPExpiry = undefined;
    user.lastLogin = new Date();
    user.refreshToken = signRefresh(user._id);
    await user.save({ validateBeforeSave: false });

    sendWelcome(user).catch(console.error);
    sendTokens(user, 200, res);
});

// POST /api/auth/resend-otp
export const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({
        email
    }).select("+verifyOTP +verifyOTPExpiry");
    if (!user) throw new AppError("User not found", 404);
    if (user.isVerified) throw new AppError("Already verified", 400);

    // Prevent spam — block if OTP was sent less than 60s ago
    const cooldown = new Date(Date.now() - 60 * 1000);
    if (user.verifyOTPExpiry && user.verifyOTPExpiry > new Date(Date.now() + 9 * 60 * 1000)) {
        throw new AppError("Please wait 1 minute before requesting a new OTP.", 429);
    }

    const otp = generateOTP();
    user.verifyOTP = hashOTP(otp);
    user.verifyOTPExpiry = otpExpiry(10);
    await user.save({ validateBeforeSave: false });

    await sendVerificationOTP(user, otp);
    res.json({
        success: true,
        message: "New OTP sent."
    });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({
        email
    }).select("+password +refreshToken");
    if (!user) throw new AppError("Invalid credentials", 401);

    if (user.authProvider === "google" && !user.password)
        throw new AppError("This account uses Google sign-in.", 401);

    const valid = await user.comparePassword(password);
    if (!valid) throw new AppError("Invalid credentials", 401);

    // Unverified — resend OTP and tell client
    if (!user.isVerified) {
        const otp = generateOTP();
        user.verifyOTP = hashOTP(otp);
        user.verifyOTPExpiry = otpExpiry(10);
        await user.save({ validateBeforeSave: false });
        await sendVerificationOTP(user, otp);

        return res.status(403).json({
            success: false,
            needsVerification: true,
            message: "Email not verified. A new OTP has been sent.",
        });
    }

    user.refreshToken = signRefresh(user._id);
    user.lastLogin = new Date();
    await user.save({
        validateBeforeSave: false
    });

    sendTokens(user, 200, res);
});

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) throw new AppError("No refresh token", 401);

    let decoded;
    try { decoded = verifyRefresh(token); }
    catch {
        throw new AppError("Invalid or expired refresh token", 401);
    }

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token)
        throw new AppError("Token reuse detected. Please log in again.", 401);

    res.json({
        success: true,
        accessToken: signAccess(user._id)
    });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logged out" });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    // Same response regardless — prevents email enumeration
    if (!user || user.authProvider === "google") {
        return res.json({ success: true, message: "If that email exists, an OTP has been sent." });
    }

    const otp = generateOTP();
    user.resetOTP = hashOTP(otp);
    user.resetOTPExpiry = otpExpiry(15);
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetOTP(user, otp);
    res.json({ success: true, message: "If that email exists, an OTP has been sent." });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select("+resetOTP +resetOTPExpiry");
    if (!user) throw new AppError("User not found", 404);

    if (!user.resetOTPExpiry || user.resetOTPExpiry < new Date())
        throw new AppError("OTP expired", 400);
    if (!matchOTP(otp, user.resetOTP))
        throw new AppError("Invalid OTP", 400);

    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    user.refreshToken = undefined; // invalidate all sessions
    await user.save();

    sendPasswordChanged(user).catch(console.error);
    res.json({ success: true, message: "Password updated. Please log in." });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate("savedCharts", "name birthDate sunSign createdAt")
        .lean();

    res.json({ success: true, user });
});

// PUT /api/auth/update-profile
export const updateProfile = asyncHandler(async (req, res) => {
    const allowed = ["name", "birthDate", "birthTime", "birthPlace", "birthCoordinates", "language"];
    const updates = Object.fromEntries(
        Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true, runValidators: true,
    });

    res.json({ success: true, user });
});

// PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    if (user.authProvider === "google" && !user.password)
        throw new AppError("Google accounts do not have a password", 400);

    if (!(await user.comparePassword(currentPassword)))
        throw new AppError("Current password is incorrect", 400);

    user.password = newPassword;
    user.refreshToken = undefined;
    await user.save();

    sendPasswordChanged(user).catch(console.error);
    res.json({ success: true, message: "Password changed. Please log in again." });
});

// GET /api/auth/google  →  passport redirects to Google
export const googleAuth = passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
});

// GET /api/auth/google/callback
export const googleCallback = [
    passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google` }),
    asyncHandler(async (req, res) => {
        const user = req.user;
        const refreshToken = signRefresh(user._id);

        await User.findByIdAndUpdate(user._id, { refreshToken, lastLogin: new Date() });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        // Pass access token via query param — frontend reads it once then discards
        const accessToken = signAccess(user._id);
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
    }),
];