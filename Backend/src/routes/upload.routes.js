import { Router } from "express";
import rateLimit from "express-rate-limit";
import { uploadChatImage } from "../controllers/upload.controller.js";
import { handleUpload } from "../services/upload.service.js";
import { protect, requireVerified } from "../middleware/auth.js";

const router = Router();

const uploadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many uploads. Try again in a minute." },
});

router.use(protect, requireVerified);

// POST /api/upload/chat-image
router.post("/chat-image", uploadLimiter, handleUpload, uploadChatImage);

export default router;