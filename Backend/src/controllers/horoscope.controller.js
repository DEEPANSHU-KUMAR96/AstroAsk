import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import {
    getOrGenerateHoroscope,
    getAllHoroscopes,
    streamHoroscope,
    SIGNS,
} from "../services/horoscope.service.js";

const VALID_PERIODS = ["daily", "weekly", "monthly"];

const validateSign = (sign) => {
    if (!SIGNS.includes(sign.toLowerCase())) {
        throw new AppError(`Invalid sign. Valid signs: ${SIGNS.join(", ")}`, 400);
    }
    return sign.toLowerCase();
};

const validatePeriod = (period) => {
    if (!VALID_PERIODS.includes(period)) {
        throw new AppError("Period must be daily, weekly, or monthly", 400);
    }
    return period;
};

// GET /api/horoscope/:sign/:period
export const getHoroscope = asyncHandler(async (req, res) => {
    const sign = validateSign(req.params.sign);
    const period = validatePeriod(req.params.period);
    const lang = req.query.lang === "hi" ? "hi" : "en";

    const content = await getOrGenerateHoroscope(sign, period, lang);

    res.json({
        success: true,
        sign, period, lang, content
    });
});

// GET /api/horoscope/today/:sign  — quick daily shortcut
export const getTodayHoroscope = asyncHandler(async (req, res) => {
    const sign = validateSign(req.params.sign);
    const lang = req.query.lang === "hi" ? "hi" : "en";

    const content = await getOrGenerateHoroscope(sign, "daily", lang);

    res.json({
        success: true,
        sign, period: "daily",
        lang, content
    });
});

// GET /api/horoscope/all?period=daily&lang=en
export const getAllSignsHoroscope = asyncHandler(async (req, res) => {
    const period = validatePeriod(req.query.period || "daily");
    const lang = req.query.lang === "hi" ? "hi" : "en";

    const horoscopes = await getAllHoroscopes(period, lang);

    res.json({
        success: true,
        period, lang, horoscopes
    });
});

// GET /api/horoscope/:sign/:period/stream
export const streamHoroscopeHandler = asyncHandler(async (req, res) => {
    const sign = validateSign(req.params.sign);
    const period = validatePeriod(req.params.period);
    const lang = req.query.lang === "hi" ? "hi" : "en";

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    await streamHoroscope(sign, period, lang, (text) => {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    res.write("data: [DONE]\n\n");
    res.end();
});