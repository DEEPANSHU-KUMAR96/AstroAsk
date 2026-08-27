import Kundli from "../models/kundli.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { geocodePlace } from "../services/Geocode.service.js";
import { generateKundli } from "../services/astrology.service.js";
import { generateAIReading } from "../services/kundli.ai.service.js";

// POST /api/kundli/generate
export const generate = asyncHandler(async (req, res) => {
    const { name, birthDate, birthTime, birthPlace } = req.body;

    if (!name || !birthDate || !birthTime || !birthPlace) {
        throw new AppError("name, birthDate, birthTime, birthPlace are required", 400);
    }

    // Geocode birthPlace → lat, lng, timezone
    const geo = await geocodePlace(birthPlace);

    // Calculate planetary positions
    const chart = generateKundli(
        new Date(birthDate),
        birthTime,
        geo.lat,
        geo.lng
    );

    const kundli = await Kundli.create({
        userId: req.user._id,
        name,
        birthDate: new Date(birthDate),
        birthTime,
        birthPlace: geo.formatted,
        lat: geo.lat,
        lng: geo.lng,
        timezone: geo.timezone,
        ...chart,
    });

    // Add to user's savedCharts
    await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { savedCharts: kundli._id },
    });

    res.status(201).json({
        success: true,
        kundli,
        message: "Kundli generated",
    });
});

// GET /api/kundli
export const getAll = asyncHandler(async (req, res) => {
    const kundlis = await Kundli.find({ userId: req.user._id })
        .select("name birthDate birthPlace sunSign moonSign ascendant createdAt")
        .sort({ createdAt: -1 })
        .lean();

    res.json({
        success: true,
        count: kundlis.length,
        kundlis,
        message: "Kundlis fetched",
    });
});

// GET /api/kundli/:id
export const getOne = asyncHandler(async (req, res) => {
    const kundli = await Kundli.findOne({
        _id: req.params.id,
        userId: req.user._id,
    }).lean();

    if (!kundli) throw new AppError("Kundli not found", 404);

    res.json({
        success: true,
        kundli,
        message: "Kundli fetched",
    });
});

// DELETE /api/kundli/:id
export const remove = asyncHandler(async (req, res) => {
    const kundli = await Kundli.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id,
    });

    if (!kundli) throw new AppError("Kundli not found", 404);

    await User.findByIdAndUpdate(req.user._id, {
        $pull: { savedCharts: kundli._id },
    });

    res.json({
        success: true,
        message: "Kundli deleted",

    });
});

// POST /api/kundli/:id/reading
export const getAIReading = asyncHandler(async (req, res) => {
    const kundli = await Kundli.findOne({
        _id: req.params.id,
        userId: req.user._id,
    });

    if (!kundli) {
        throw new AppError("Kundli not found", 404);
    }

    const lang = req.query.lang === "hi" ? "hi" : "en";

    // Return cached reading only for English
    if (lang === "en" && kundli.aiReading?.summary) {
        return res.json({
            success: true,
            reading: kundli.aiReading,
            fromCache: true,
        });
    }

    const reading = await generateAIReading(kundli, lang);

    kundli.aiReading = {
        ...reading,
        generatedAt: new Date(),
    };

    await kundli.save();

    res.json({
        success: true,
        reading: kundli.aiReading,
    });
});