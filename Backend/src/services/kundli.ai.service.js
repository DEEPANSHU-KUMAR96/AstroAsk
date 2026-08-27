import { groqComplete, MODELS } from "./grok.service.js";

const buildReadingPrompt = (kundli, lang) => {
    const langLine = lang === "hi" ? "Respond in Hindi only." : "Respond in English.";

    const planetList = kundli.planets
        .map((p) => `${p.name} in ${p.sign} (House ${p.house}${p.isRetro ? ", Retrograde" : ""})`)
        .join(", ");

    return `You are an expert Vedic astrologer. Analyze this birth chart and give a detailed reading.

Ascendant: ${kundli.ascendant.sign}
Sun Sign: ${kundli.sunSign}
Moon Sign: ${kundli.moonSign}
Current Dasha: ${kundli.currentDasha?.planet}
Planets: ${planetList}

${langLine}
Return ONLY valid JSON — no markdown, no extra text:
{
  "summary":    "3-4 sentences about overall life theme and personality",
  "strengths":  ["strength 1", "strength 2", "strength 3"],
  "challenges": ["challenge 1", "challenge 2"],
  "career":     "2 sentences about career and professional life",
  "love":       "2 sentences about relationships and love life",
  "health":     "1-2 sentences about health tendencies"
}`;
};

const sanitizeJSON = (text) => {
    const stripped = text.replace(/```json|```/g, "").trim();
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON from AI");
    return JSON.parse(match[0]);
};

export const generateAIReading = async (kundli, lang = "en") => {
    const text = await groqComplete(buildReadingPrompt(kundli, lang), MODELS.BALANCED, 1024);
    return sanitizeJSON(text);
};