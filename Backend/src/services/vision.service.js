import { Mistral } from "@mistralai/mistralai";
import { config } from "../config/config.js";

const getMistralClient = () => {
    const key = config.MISTRAL_API_KEY || process.env.MISTRAL_API_KEY;
    if (!key) throw new Error("MISTRAL_API_KEY is not configured in backend .env");
    return new Mistral({ apiKey: key });
};

const getVisionSystemPrompt = (isHindi) => {
    if (isHindi) {
        return `You are AstroAsk — an expert Vedic astrologer (ज्योतिषाचार्य) and palmist (हस्तरेखा विशेषज्ञ).
CRITICAL LANGUAGE DIRECTIVE:
You MUST deliver your entire response strictly in Hindi (हिंदी) using Devanagari script.

When analyzing an image:
1. Birth Chart / Lagna Chart (जन्म कुंडली / लग्न चक्र / नवमांश):
   - Identify the Lagna (Ascendant sign) and Lagnesh (लग्न भाव और लग्नेश).
   - Identify the 12 houses and planetary placements (सूर्य, चंद्र, मंगल, बुध, गुरु, शुक्र, शनि, राहु, केतु).
   - Check house positions, conjunctions (युति), aspects (दृष्टि), exaltation (उच्च) and debilitation (नीच).
   - Identify important Yogas (राज योग, गजकेसरी, धन योग, मांगलिक दोष आदि).
   - Answer the user's question directly with authentic astrological insights.
   - Provide positive, authentic Vedic remedies (मंत्र, रत्न, दान, शुभ रंग और दिन).
2. Palmistry (हस्तरेखा):
   - Read the Life line (जीवन रेखा), Heart line (हृदय रेखा), Head line (मस्तिष्क रेखा), Fate line (भाग्य रेखा) and mounts (पर्वत).
   - Provide practical guidance and strengths.
3. Other sacred astrology images:
   - Provide respectful, authentic Vedic interpretation.

Be warm, compassionate, and precise. Format with clear markdown headings and bullet points.`;
    }

    return `You are AstroAsk — an expert Vedic astrologer and palmist.
CRITICAL LANGUAGE DIRECTIVE:
You MUST deliver your entire response strictly in English.

When analyzing an image:
1. Birth Chart / Lagna Chart / Navamsha Chart:
   - Identify the Lagna (Ascendant sign) and the Ascendant lord (Lagnesh).
   - Examine the 12 houses and key planetary placements (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu).
   - Evaluate Kendra (1, 4, 7, 10) and Trikona (1, 5, 9) houses, planetary strengths, exaltations, debilitations, and aspects.
   - Identify prominent yogas (e.g. Raja Yoga, Gajakesari Yoga, Dhana Yoga, Mangal Dosha).
   - Directly answer the user's specific questions with clear astrological logic.
   - Provide constructive Vedic remedies (mantras, gemstones, charity, auspicious days and colors).
2. Palmistry:
   - Analyze the Life Line, Heart Line, Head Line, Fate Line, and planetary mounts (Jupiter, Venus, Sun, Saturn, etc.).
   - Give practical guidance on career, vitality, and emotional strengths.
3. Other astrology-related images:
   - Provide clear, insightful Vedic interpretation.

Maintain a warm, insightful, and empowering tone. Use clean markdown formatting with headings and bullet points.`;
};

// Streaming image analysis
export const analyzeImageStream = async (imageUrl, userMessage, chatHistory = [], onChunk, lang = "en") => {
    const isHindi = lang === "hi" || lang?.toLowerCase()?.startsWith("hi");
    const systemPrompt = getVisionSystemPrompt(isHindi);
    const mistral = getMistralClient();

    const messages = [
        {
            role: "system",
            content: systemPrompt,
        },
    ];

    // Add recent context (last 4 messages)
    if (Array.isArray(chatHistory)) {
        const recent = chatHistory.slice(-4);
        for (const msg of recent) {
            if (msg.role === "user" && msg.content && msg.content !== "Image attached") {
                messages.push({
                    role: "user",
                    content: [{ type: "text", text: msg.content }],
                });
            } else if (msg.role === "assistant" && msg.content) {
                messages.push({
                    role: "assistant",
                    content: [{ type: "text", text: msg.content }],
                });
            }
        }
    }

    const defaultPrompt = isHindi
        ? "कृपया इस लग्न चक्र / कुंडली / हस्तरेखा छवि का विस्तृत और प्रामाणिक वैदिक विश्लेषण करें।"
        : "Please analyze this Lagna chart / birth chart / palm image in detail from a Vedic astrology perspective.";

    const promptText = (userMessage && userMessage.trim()) ? userMessage.trim() : defaultPrompt;

    messages.push({
        role: "user",
        content: [
            { type: "text", text: promptText },
            { type: "image_url", imageUrl },
        ],
    });

    const stream = await mistral.chat.stream({
        model: "pixtral-12b-2409",
        messages,
        temperature: 0.7,
        maxTokens: 1500,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
        const text = chunk.data?.choices?.[0]?.delta?.content || "";
        if (text) {
            fullResponse += text;
            onChunk(text);
        }
    }

    return fullResponse;
};

// Non-streaming image analysis
export const analyzeImage = async (imageUrl, userMessage, chatHistory = [], lang = "en") => {
    let result = "";
    await analyzeImageStream(imageUrl, userMessage, chatHistory, (chunk) => {
        result += chunk;
    }, lang);
    return result;
};
