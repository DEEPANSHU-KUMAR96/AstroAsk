import ChatSession from "../models/chatSession.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import {
    loadSessionHistory,
    runAgentStream,
    clearSessionHistory,
    generateChatTitle,
} from "../services/chat.agent.js";

// POST /api/chat — create new session
export const createSession = asyncHandler(async (req, res) => {
    const session = await ChatSession.create({
        userId: req.user._id,
        title: "New Chat",
    });
    res.status(201).json({
        success: true,
        session,
        message: "Session created",
    });
});

// GET /api/chat — all sessions for user
export const getSessions = asyncHandler(async (req, res) => {
    const sessions = await ChatSession.find({ userId: req.user._id })
        .select("title createdAt updatedAt")
        .sort({ updatedAt: -1 })
        .lean();
    res.json({
        success: true,
        sessions,
        message: "Sessions fetched",
    });
});

// GET /api/chat/:id — single session with messages
export const getSession = asyncHandler(async (req, res) => {
    const session = await ChatSession.findOne({
        _id: req.params.id,
        userId: req.user._id,
    }).lean();
    if (!session) throw new AppError("Session not found", 404);
    res.json({
        success: true,
        session,
        message: "Session fetched",
    });
});

// DELETE /api/chat/:id
export const deleteSession = asyncHandler(async (req, res) => {
    const session = await ChatSession.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id,
    });
    if (!session) throw new AppError("Session not found", 404);
    clearSessionHistory(req.params.id);
    res.json({
        success: true,
        message: "Session deleted",
    });
});

// POST /api/chat/:id/message — send message, stream response
export const sendMessage = asyncHandler(async (req, res) => {
    const { message, lang } = req.body;
    if (!message?.trim()) throw new AppError("Message is required", 400);

    const session = await ChatSession.findOne({
        _id: req.params.id,
        userId: req.user._id,
    });
    if (!session) throw new AppError("Session not found", 404);

    const requestedLang = (
        lang ||
        req.query.lang ||
        req.headers["x-language"] ||
        "en"
    ).toString().toLowerCase();

    // Load existing messages into LangChain memory
    await loadSessionHistory(session._id.toString(), session.messages);

    // Save user message to DB
    session.messages.push({
        role: "user",
        content: message.trim(),
    });

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let aiResponse = "";

    try {
        await runAgentStream(
            session._id.toString(),
            message.trim(),
            req.user._id.toString(),
            (chunk) => {
                aiResponse += chunk;
                res.write(`data: ${JSON.stringify({ type: "chunk", text: chunk })}\n\n`);
            },
            requestedLang
        );

        // Save AI response to DB
        session.messages.push({ role: "assistant", content: aiResponse });

        // Auto-title with AI on first message exchange
        if (session.messages.length === 2) {
            try {
                session.title = await generateChatTitle(message.trim(), aiResponse, requestedLang);
            } catch (e) {
                const clean = message.replace(/^\[[^\]]+\]\s*/, "").trim();
                session.title = clean.slice(0, 35) || "Cosmic Consultation";
            }
        }

        await session.save();

        res.write(`data: ${JSON.stringify({ type: "done", sessionId: session._id, title: session.title })}\n\n`);
    } catch (err) {
        res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
    } finally {
        res.end();
    }
});