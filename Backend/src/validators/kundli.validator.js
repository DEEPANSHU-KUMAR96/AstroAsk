import { body } from "express-validator";

export const generateRules = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("birthDate").isISO8601().withMessage("Valid date required (YYYY-MM-DD)"),
    body("birthTime")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Valid time required (HH:MM)"),
    body("birthPlace").trim().notEmpty().withMessage("Birth place is required"),
];
