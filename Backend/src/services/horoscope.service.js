import Horoscope from "../models/horoscope.model.js";

import {
    groqComplete,
    groqStream,
    MODELS,
} from "../services/grok.service.js";

const SIGNS = [
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
];

const SIGN_INFO = {
    aries: {
        element: "Fire",
        ruler: "Mars",
        symbol: "♈",
    },

    taurus: {
        element: "Earth",
        ruler: "Venus",
        symbol: "♉",
    },

    gemini: {
        element: "Air",
        ruler: "Mercury",
        symbol: "♊",
    },

    cancer: {
        element: "Water",
        ruler: "Moon",
        symbol: "♋",
    },

    leo: {
        element: "Fire",
        ruler: "Sun",
        symbol: "♌",
    },

    virgo: {
        element: "Earth",
        ruler: "Mercury",
        symbol: "♍",
    },

    libra: {
        element: "Air",
        ruler: "Venus",
        symbol: "♎",
    },

    scorpio: {
        element: "Water",
        ruler: "Mars",
        symbol: "♏",
    },

    sagittarius: {
        element: "Fire",
        ruler: "Jupiter",
        symbol: "♐",
    },

    capricorn: {
        element: "Earth",
        ruler: "Saturn",
        symbol: "♑",
    },

    aquarius: {
        element: "Air",
        ruler: "Saturn",
        symbol: "♒",
    },

    pisces: {
        element: "Water",
        ruler: "Jupiter",
        symbol: "♓",
    },
};

// Generate period key
export const getPeriodKey = (period) => {
    const now = new Date();

    // Daily
    if (period === "daily") {
        return now.toISOString().split("T")[0];
    }

    // Weekly
    if (period === "weekly") {
        const start = new Date(now.getFullYear(), 0, 1);

        const week = Math.ceil(
            ((now - start) / 86400000 +
                start.getDay() +
                1) /
            7
        );

        return `${now.getFullYear()}-W${String(week).padStart(
            2,
            "0"
        )}`;
    }

    // Monthly
    return `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}`;
};

// Build AI prompt
const buildPrompt = (sign, period, lang) => {
    const info = SIGN_INFO[sign];

    const periodLabel = {
        daily: "today's",
        weekly: "this week's",
        monthly: "this month's",
    }[period];

    const langLine =
        lang === "hi"
            ? "Respond in Hindi language only."
            : "Respond in English only.";

    return `
You are an expert Vedic astrologer with 30 years of experience.

Generate ${periodLabel} horoscope for ${sign} ${info.symbol}.

Sign: ${info.element} element, ruled by ${info.ruler}.

${langLine}

Be specific and avoid generic statements.

IMPORTANT:
Return ONLY a valid JSON object.
Do not return Markdown.
Do not use code blocks.
Do not use \`\`\`json.
Do not include any explanation before or after the JSON.

The response MUST follow exactly this JSON structure:

{
    "general": "string",
    "love": "string",
    "career": "string",
    "health": "string",
    "finance": "string",
    "lucky": {
        "number": 7,
        "color": "Blue",
        "day": "Wednesday"
    },
    "rating": 4
}

Rules:
- general must be a horoscope prediction.
- love must describe the love/relationship aspect.
- career must describe career/work.
- health must describe general wellness.
- finance must describe financial outlook.
- lucky.number must be a number.
- lucky.color must be a string.
- lucky.day must be a weekday.
- rating must be a number from 1 to 5.
- All horoscope text must be in the requested language.
- Return valid JSON only.
`.trim();
};

// Safely extract JSON from AI response
const sanitizeJSON = (text) => {
    if (typeof text !== "string") {
        throw new Error("AI response was not text");
    }

    const stripped = text
        // Remove <think>...</think> blocks
        .replace(/<think>[\s\S]*?<\/think>/gi, "")

        // Remove markdown code fences
        .replace(/```json/gi, "")
        .replace(/```/gi, "")

        .trim();

    // First attempt: response is already valid JSON
    try {
        return JSON.parse(stripped);
    } catch {
        // Continue with extraction
    }

    // Find first JSON object
    const start = stripped.indexOf("{");

    if (start === -1) {
        throw new Error(
            `No valid JSON found in AI response: ${stripped}`
        );
    }

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (
        let index = start;
        index < stripped.length;
        index += 1
    ) {
        const character = stripped[index];

        // Inside JSON string
        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (character === "\\") {
                escaped = true;
            } else if (character === '"') {
                inString = false;
            }

            continue;
        }

        // Start of string
        if (character === '"') {
            inString = true;
        }

        // Opening object
        else if (character === "{") {
            depth += 1;
        }

        // Closing object
        else if (character === "}") {
            depth -= 1;

            // Complete JSON object found
            if (depth === 0) {
                const jsonString = stripped.slice(
                    start,
                    index + 1
                );

                try {
                    return JSON.parse(jsonString);
                } catch {
                    break;
                }
            }
        }
    }

    throw new Error(
        `No valid JSON found in AI response: ${stripped}`
    );
};

// Generate horoscope using AI
const generateFromAI = async (sign, period, lang) => {
    const prompt = buildPrompt(
        sign,
        period,
        lang
    );

    const text = await groqComplete(
        prompt,
        MODELS.STRUCTURED,
        1024
    );

    console.log("AI HOROSCOPE RESPONSE:");
    console.log(text);

    return sanitizeJSON(text);
};

// Get existing horoscope or generate a new one
export const getOrGenerateHoroscope = async (
    sign,
    period,
    lang = "en"
) => {
    const periodKey = getPeriodKey(period);

    // Check MongoDB cache first
    const existing = await Horoscope.findOne({
        sign,
        period,
        periodKey,
        lang,
    }).lean();

    if (existing) {
        return existing.content;
    }

    // Generate using AI
    const content = await generateFromAI(
        sign,
        period,
        lang
    );

    // Save to MongoDB
    await Horoscope.findOneAndUpdate(
        {
            sign,
            period,
            periodKey,
            lang,
        },
        {
            $setOnInsert: {
                sign,
                period,
                periodKey,
                lang,
                content,
            },
        },
        {
            upsert: true,
            new: true,
        }
    );

    return content;
};

// Get all horoscopes
export const getAllHoroscopes = async (
    period,
    lang = "en"
) => {
    const results = await Promise.allSettled(
        SIGNS.map((sign) =>
            getOrGenerateHoroscope(
                sign,
                period,
                lang
            )
        )
    );

    return SIGNS.reduce(
        (acc, sign, index) => {
            if (
                results[index].status ===
                "fulfilled"
            ) {
                acc[sign] =
                    results[index].value;
            }

            return acc;
        },
        {}
    );
};

// Streaming horoscope
export const streamHoroscope = async (
    sign,
    period,
    lang = "en",
    onChunk
) => {
    const info = SIGN_INFO[sign];

    const periodLabel = {
        daily: "today's",
        weekly: "this week's",
        monthly: "this month's",
    }[period];

    const langLine =
        lang === "hi"
            ? "Respond in Hindi."
            : "Respond in English.";

    const prompt = `
Expert Vedic astrologer.

Give ${periodLabel} horoscope for ${sign}
(${info.element}, ruled by ${info.ruler}).

Be specific.

${langLine}
`.trim();

    await groqStream(
        prompt,
        onChunk,
        MODELS.FAST
    );
};

export { SIGNS };