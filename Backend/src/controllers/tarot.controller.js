import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { drawCards, SPREADS } from "../data/tarotDeck.data.js";
import { generateTarotReading, streamTarotReading } from "../services/tarot.service.js";

const VALID_SPREADS = Object.keys(SPREADS);

// GET /api/tarot/draw?spread=single&question=...&lang=en
export const draw = asyncHandler(async (req, res) => {
    const spread = req.query.spread || "single";
    const question = req.query.question?.trim() || "";
    const lang = req.query.lang === "hi" ? "hi" : "en";

    if (!VALID_SPREADS.includes(spread)) {
        throw new AppError(`Invalid spread. Choose: ${VALID_SPREADS.join(", ")}`, 400);
    }

    const spreadInfo = SPREADS[spread];
    const cards = drawCards(spreadInfo.count);
    const reading = await generateTarotReading(cards, spreadInfo.positions, question, lang);

    res.json({
        success: true,
        spread: spreadInfo.name,
        question: question || null,
        lang,
        cards,
        reading,
    });
});

// GET /api/tarot/draw/stream?spread=three&question=...
export const drawStream = asyncHandler(async (req, res) => {
    const spread = req.query.spread || "single";
    const question = req.query.question?.trim() || "";
    const lang = req.query.lang === "hi" ? "hi" : "en";

    if (!VALID_SPREADS.includes(spread)) {
        throw new AppError(`Invalid spread. Choose: ${VALID_SPREADS.join(", ")}`, 400);
    }

    const spreadInfo = SPREADS[spread];
    const cards = drawCards(spreadInfo.count);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Send cards first so frontend can show them immediately
    res.write(`data: ${JSON.stringify({
        type: "cards",
        cards, spread: spreadInfo.name
    })}\n\n`);

    await streamTarotReading(
        cards,
        spreadInfo.positions,
        question,
        lang,
        (chunk) => res.write(`data: ${JSON.stringify({
            type: "chunk",
            text: chunk
        })}\n\n`)
    );

    res.write(`data: ${JSON.stringify({
        type: "done"
    })}\n\n`);
    res.end();
});

// GET /api/tarot/spreads — list available spreads
export const getSpreads = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        spreads: SPREADS
    });
});