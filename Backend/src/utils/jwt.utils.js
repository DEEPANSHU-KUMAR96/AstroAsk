import jwt from "jsonwebtoken";

export const signAccess = (id) =>
    jwt.sign({ id, type: "access" }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });

export const signRefresh = (id) =>
    jwt.sign({ id, type: "refresh" }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    });

export const verifyAccess = (token) =>
    jwt.verify(token, process.env.JWT_SECRET);

export const verifyRefresh = (token) =>
    jwt.verify(token, process.env.JWT_REFRESH_SECRET);

// Attach refresh token as httpOnly cookie + return access token in body
export const sendTokens = (user, statusCode, res) => {
    const accessToken = signAccess(user._id);
    const refreshToken = user.refreshToken || signRefresh(user._id);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(statusCode).json({
        success: true,
        accessToken,
        user,
    });
};