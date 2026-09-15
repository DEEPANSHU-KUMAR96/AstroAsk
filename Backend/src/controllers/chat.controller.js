import ChatSession from "../models/chatSession.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import {
    loadSessionHistory,
    runAgentStream,
    clearSessionHistory,
    generateChatTitle,
} from "../services/chat.agent.js";

import { analyzeImageStream } from "../services/vision.service.js";
import { uploadToImageKit } from "../services/upload.service.js";

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
    const textMessage = message?.trim() || "";
    if (!textMessage && !req.file) throw new AppError("Message or image is required", 400);

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

    let image;
    if (req.file) {
        image = await uploadToImageKit(req.file.path, req.file.originalname, "chat");
    }

    // Check if user refers to a previously uploaded image in this session
    const lastImageMsg = [...session.messages].reverse().find((m) => m.imageUrl);
    const refersToImage = !image && lastImageMsg && (
        /image|photo|chart|kundli|lagna|kundali|kundaly|pic|upload|हस्तरेखा|कुंडली|लग्न|चार्ट|फोटो/i.test(textMessage) ||
        session.messages.length <= 2
    );

    // Load existing messages into LangChain memory
    await loadSessionHistory(session._id.toString(), session.messages);

    // Save user message to DB
    session.messages.push({
        role: "user",
        content: textMessage || "Image attached",
        imageUrl: image?.url,
        imageFileId: image?.fileId,
        imageName: image?.name,
    });

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let aiResponse = "";

    try {
        const onChunk = (chunk) => {
            aiResponse += chunk;
            res.write(`data: ${JSON.stringify({ type: "chunk", text: chunk })}\n\n`);
        };

        if (image) {
            try {
                await analyzeImageStream(image.url, textMessage, session.messages, onChunk, requestedLang);
            } catch (visionErr) {
                console.error("Vision stream error, falling back to agent:", visionErr);
                const fallbackNote = `[User uploaded an astrology chart image (${image.name || "chart"}). User query: ${textMessage || "Please analyze my chart"}]`;
                await runAgentStream(session._id.toString(), fallbackNote, req.user._id.toString(), onChunk, requestedLang);
            }
        } else if (refersToImage && lastImageMsg?.imageUrl) {
            try {
                await analyzeImageStream(lastImageMsg.imageUrl, textMessage, session.messages, onChunk, requestedLang);
            } catch (visionErr) {
                console.error("Vision follow-up error, falling back to agent:", visionErr);
                await runAgentStream(
                    session._id.toString(),
                    textMessage,
                    req.user._id.toString(),
                    onChunk,
                    requestedLang
                );
            }
        } else {
            await runAgentStream(
                session._id.toString(),
                textMessage,
                req.user._id.toString(),
                onChunk,
                requestedLang
            );
        }

        // Save AI response to DB
        session.messages.push({ role: "assistant", content: aiResponse });

        // Auto-title with AI on first message exchange
        if (session.messages.length === 2) {
            try {
                session.title = await generateChatTitle(
                    textMessage || (image ? "Lagna Chart Analysis" : "Cosmic Consultation"),
                    aiResponse,
                    requestedLang
                );
            } catch (e) {
                const clean = textMessage.replace(/^\[[^\]]+\]\s*/, "").trim();
                session.title = clean.slice(0, 35) || (image ? "Chart Analysis" : "Cosmic Consultation");
            }
        }

        await session.save();

        res.write(`data: ${JSON.stringify({ type: "done", sessionId: session._id, title: session.title })}\n\n`);
    } catch (err) {
        console.error("Chat controller error:", err);
        res.write(`data: ${JSON.stringify({ 
            type: "error",
             message: err.message 
            })}\n\n`);
    } finally {
        res.end();
    }
});
