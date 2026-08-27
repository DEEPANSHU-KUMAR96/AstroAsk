import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import passport from "passport";

import { configurePassport } from "./config/passport.js";
import errorHandler from "./middleware/errorHandler.js";
import kundliRoutes from "./routes/kundli.routes.js";

import authRoutes from "./routes/auth.routes.js";
import horoscopeRoutes from "./routes/horoscope.routes.js";

const app = express();


app.use(helmet());
app.use(cors({
    origin: "http://localhost:5173" || "http://localhost:3000",
    credentials: true,
}));

// Core
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// Passport
configurePassport();
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/horoscope", horoscopeRoutes);
app.use("/api/kundli", kundliRoutes);

// 404
app.use((req, res) =>
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
);

// Global error handler — must be last
app.use(errorHandler);

export default app;