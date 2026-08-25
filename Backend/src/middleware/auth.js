import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyAccess } from "../utils/jwt.utils.js";

export const protect = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new AppError("Not authenticated", 401);

    const token = header.slice(7).trim();
    if (!token) throw new AppError("Not authenticated", 401);

    let decoded;
    try {
        decoded = verifyAccess(token);
    } catch {
        throw new AppError("Invalid or expired access token", 401);
    }

    if (decoded.type !== "access") throw new AppError("Invalid token", 401);

    const user = await User.findById(decoded.id).lean();
    if (!user) throw new AppError("User not found", 401);

    req.user = user;
    next();
});

export const requireVerified = (req, res, next) => {
    if (!req.user.isVerified) throw new AppError("Please verify your email first", 403);
    next();
};

export const requirePlan = (...plans) => (req, res, next) => {
    if (!plans.includes(req.user.plan)) {
        throw new AppError(`This feature requires ${plans.join(" or ")} plan`, 403);
    }
    next();
};