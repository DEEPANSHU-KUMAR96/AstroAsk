import mongoose from "mongoose";

const planetSchema = new mongoose.Schema(
    {
        name: String,
        sign: String,
        degree: Number,
        house: Number,
        nakshatra: String,
        isRetro: Boolean,
    },
    { _id: false }
);

const houseSchema = new mongoose.Schema(
    {
        house: Number,
        sign: String,
        degree: Number,
    },
    { _id: false }
);

const kundliSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Input
        name: { type: String, required: true },
        birthDate: { type: Date, required: true },
        birthTime: { type: String, required: true },
        birthPlace: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        timezone: { type: String },

        // Calculated
        planets: [planetSchema],
        houses: [houseSchema],
        ascendant: {
            sign: String,
            degree: Number,
        },
        sunSign: String,
        moonSign: String,

        // Vimshottari Dasha
        currentDasha: {
            planet: String,
            startDate: Date,
            endDate: Date,
        },
        dashaSequence: [
            {
                planet: String,
                startDate: Date,
                endDate: Date,
                years: Number,
                _id: false,
            },
        ],

        // AI reading — generated on demand
        aiReading: {
            summary: String,
            strengths: [String],
            challenges: [String],
            career: String,
            love: String,
            health: String,
            generatedAt: Date,
        },
    },
    { timestamps: true }
);

kundliSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Kundli", kundliSchema);