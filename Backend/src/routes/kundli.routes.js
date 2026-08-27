import { Router } from "express";
import rateLimit from "express-rate-limit";
import { generate, getAll, getOne, remove, getAIReading } from "../controllers/kundli.controller.js";
import { protect, requireVerified } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { generateRules } from "../validators/kundli.validator.js";

const router = Router();

const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many AI requests. Try again in a minute."
    },
});

// All kundli routes require auth + verified email
router.use(protect, requireVerified);

router.post("/generate", generateRules, validate, generate);
router.get("/", getAll);
router.get("/:id", getOne);
router.delete("/:id", remove);
router.post("/:id/reading", aiLimiter, getAIReading);

export default router;