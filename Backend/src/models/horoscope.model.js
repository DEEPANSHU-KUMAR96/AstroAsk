import mongoose from "mongoose";

const horoscopeSchema = new mongoose.Schema(
    {
        sign: {
            type: String,
            required: true,
            lowercase: true,
            enum: [
                "aries", "taurus", "gemini", "cancer", "leo", "virgo",
                "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
            ],
        },
        period: {
            type: String,
            required: true,
            enum: ["daily", "weekly", "monthly"],
        },
        // "2025-01-15" | "2025-W03" | "2025-01"
        periodKey: {
            type: String,
            required: true,
        },
        lang: {
            type: String,
            enum: ["en", "hi"],
            default: "en",
        },
        content: {
            general: String,
            love: String,
            career: String,
            health: String,
            finance: String,
            lucky: {
                number: Number,
                color: String,
                day: String,
            },
            rating: { type: Number, min: 1, max: 5 },
        },
    },
    { timestamps: true }
);

// One unique reading per sign + period + date + lang
horoscopeSchema.index(
    { sign: 1, period: 1, periodKey: 1, lang: 1 },
    { unique: true }
);

export default mongoose.model("Horoscope", horoscopeSchema);