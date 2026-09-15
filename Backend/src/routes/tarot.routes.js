import { Router } from "express";
import rateLimit from "express-rate-limit";
import { draw, drawStream, getSpreads } from "../controllers/tarot.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

const tarotLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many readings. Try again in a minute."
    },
});

router.use(protect);

router.get("/spreads", getSpreads);
router.get("/draw", tarotLimiter, draw);
router.get("/draw/stream", tarotLimiter, drawStream);

export default router;