import crypto from "crypto";

export const generateOTP = () =>
    String(parseInt(crypto.randomBytes(3).toString("hex"), 16) % 1000000).padStart(6, "0");

export const hashOTP = (otp) =>
    crypto.createHash("sha256").update(otp).digest("hex");

export const matchOTP = (raw, hashed) => hashOTP(raw) === hashed;

export const otpExpiry = (minutes = 10) =>
    new Date(Date.now() + minutes * 60 * 1000);