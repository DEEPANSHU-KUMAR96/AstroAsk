import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import passport from "passport";

import { configurePassport } from "./config/passport.js";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";

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
app.use("/api", routes);

// 404
app.use((req, res) =>
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
);

// Global error handler — must be last
app.use(errorHandler);

export default app;