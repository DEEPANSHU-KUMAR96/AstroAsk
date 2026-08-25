import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        // Basic Info
        name: {
            type: String,
            required: [true, "Name is required "],
            trim: true,
            maxlength: [50, "Name can not be more than 50 characters long"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "give a valid email address"],
        },
        password: {
            type: String,
            minlength: [6, "Password must be at least 6 characters long"],
            select: false, // by defaylt not comes in response
        },

        //  Auth Provider
        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },
        googleId: {
            type: String,
            sparse: true, // unique not apply on this field
            unique: true,
        },
        avatar: {
            type: String, // Google photo URL or uploaded image URL
        },

        //  Astrology Profile 
        birthDate: {
            type: Date,
        },
        birthTime: {
            type: String,   // "14:30" format
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Time HH:MM format mein do"],
        },
        birthPlace: {
            type: String,
            maxlength: 100,
        },
        birthCoordinates: {
            lat: {
                type: Number,
                min: -90,
                max: 90
            },
            lng: {
                type: Number,
                min: -180,
                max: 180
            },
        },
        sunSign: {
            type: String
        }, // "Aries", "Taurus" etc.
        moonSign: {
            type: String
        },
        ascendant: {
            type: String
        },
        language: {
            type: String,
            enum: ["hi", "en"],
            default: "hi",
        },

        // Subscription 
        plan: {
            type: String,
            enum: ["free", "basic", "premium"],
            default: "free",
        },
        planExpiresAt: {
            type: Date,
        },

        // Saved Content
        savedCharts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Kundli"
            },
        ],
        palmReadings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "PalmReading"
            },
        ],

        //  Email Verification 
        isVerified: {
            type: Boolean,
            default: false
        },
        verifyOTP: {
            type: String,
            select: false
        },
        verifyOTPExpiry: {
            type: Date,
            select: false
        },

        // Password Reset 
        resetOTP: {
            type: String,
            select: false
        },
        resetOTPExpiry: {
            type: Date,
            select: false
        },

        // Session 
        refreshToken: {
            type: String,
            select: false
        },
        lastLogin: {
            type: Date
        },
    },
    {
        timestamps: true, // createdAt, updatedAt auto
    }
);

// Indexes 
userSchema.index({ sunSign: 1 });
userSchema.index({ plan: 1, planExpiresAt: 1 });

// Pre-save: Password Hash 
userSchema.pre("save", async function () {
    // only when hash the password if it is modified
    if (!this.isModified("password") || !this.password) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Instance Methods 

// Password compare
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Plan is active or not
userSchema.methods.isPlanActive = function () {
    if (this.plan === "free") return true;
    return this.planExpiresAt && this.planExpiresAt > new Date();
};

// toJSON: for sensitive data remove
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.verifyOTP;
    delete obj.verifyOTPExpiry;
    delete obj.resetOTP;
    delete obj.resetOTPExpiry;
    delete obj.refreshToken;
    delete obj.__v;
    return obj;
};

const User = mongoose.model("User", userSchema);

export default User