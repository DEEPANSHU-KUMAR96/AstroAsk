import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
    getHoroscope,
    getTodayHoroscope,
    getAllSignsHoroscope,
    streamHoroscopeHandler,
} from "../controllers/horoscope.controller.js";

const router = Router();

// AI generation is expensive — limit it
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { 
        success: false,
         message: "Too many requests. Try again in a minute."
         },
});

router.use(aiLimiter);

// GET /api/horoscope/all?period=daily&lang=en
router.get("/all", getAllSignsHoroscope);

// GET /api/horoscope/today/:sign?lang=hi
router.get("/today/:sign", getTodayHoroscope);

// GET /api/horoscope/:sign/:period?lang=en
router.get("/:sign/:period", getHoroscope);

// GET /api/horoscope/:sign/:period/stream?lang=en
router.get("/:sign/:period/stream", streamHoroscopeHandler);

export default router;