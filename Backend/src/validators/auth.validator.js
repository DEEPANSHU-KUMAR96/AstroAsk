import { body } from "express-validator";

export { registerRules, loginRules, otpRules, resetRules };


const registerRules = [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 50 }),
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars"),
];

const loginRules = [
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
];

const otpRules = [
    body("email").isEmail().normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];

const resetRules = [
    ...otpRules,
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 chars"),
];