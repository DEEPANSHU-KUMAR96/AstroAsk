import { groqComplete, groqStream, MODELS } from "./grok.service.js";

const buildPrompt = (cards, positions, question, lang) => {
    const langLine = lang === "hi" ? "Respond in Hindi only." : "Respond in English.";

    const cardList = cards.map((card, i) => {
        const pos = positions[i] || `Card ${i + 1}`;
        const posture = card.isReversed ? "Reversed" : "Upright";
        return `${pos}: ${card.name} (${posture}) — Keywords: ${card.keywords.join(", ")}`;
    }).join("\n");

    const questionLine = question
        ? `User's question: "${question}"`
        : "No specific question — provide general guidance.";

    return `You are an expert tarot reader with deep knowledge of symbolism and intuitive interpretation.

${questionLine}

Cards drawn:
${cardList}

${langLine}
Provide a thoughtful, connected reading that interprets all cards together as a unified message.
Be specific, empathetic, and practical. Avoid being vague or overly mystical.

Return ONLY valid JSON — no markdown:
{
  "overall": "2-3 sentences connecting all cards into one unified message",
  "cards": [
    {
      "position": "position name",
      "card": "card name",
      "isReversed": true/false,
      "interpretation": "specific interpretation for this position"
    }
  ],
  "advice": "1-2 sentences of practical guidance based on the reading",
  "energy": "one word describing the overall energy (e.g. Transformative, Hopeful)"
}`;
};

const sanitizeJSON = (text) => {
    const stripped = text.replace(/```json|```/g, "").trim();
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON from AI");
    return JSON.parse(match[0]);
};

export const generateTarotReading = async (cards, positions, question, lang = "en") => {
    const text = await groqComplete(
        buildPrompt(cards, positions, question, lang),
        MODELS.BALANCED,
        1024
    );
    return sanitizeJSON(text);
};

export const streamTarotReading = async (cards, positions, question, lang = "en", onChunk) => {
    const langLine = lang === "hi" ? "Respond in Hindi." : "Respond in English.";
    const cardList = cards.map((c, i) =>
        `${positions[i]}: ${c.name} (${c.isReversed ? "Reversed" : "Upright"})`
    ).join(", ");

    const prompt = `Expert tarot reader. ${question ? `Question: "${question}".` : "General guidance."} Cards: ${cardList}. Give a connected, insightful reading. ${langLine}`;

    await groqStream(prompt, onChunk, MODELS.BALANCED);
};