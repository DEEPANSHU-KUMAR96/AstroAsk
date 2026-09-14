import { Router } from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import {
    createSession, getSessions, getSession,
    deleteSession, sendMessage,
} from "../controllers/chat.controller.js";
import { protect, requireVerified } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = Router();

const msgLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: {
         success: false,
          message: "Too many messages. Slow down."
         },
});

router.use(protect, requireVerified);

router.post("/", createSession);
router.get("/", getSessions);
router.get("/:id", getSession);
router.delete("/:id", deleteSession);
router.post(
    "/:id/message",
    msgLimiter,
    [body("message").trim().notEmpty().withMessage("Message required")],
    validate,
    sendMessage
);

export default router;