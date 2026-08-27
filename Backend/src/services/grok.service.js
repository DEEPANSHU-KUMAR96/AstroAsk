import Groq from "groq-sdk";
import { config } from "../config/config.js";

const groq = new Groq({
    apiKey: config.GROQ_API_KEY,
});

// Models available on Groq
export const MODELS = {
    FAST: "openai/gpt-oss-20b",
    BALANCED: "openai/gpt-oss-120b",

    // We handle JSON parsing ourselves using the prompt + sanitizeJSON()
    STRUCTURED: "openai/gpt-oss-20b",
};

// Standard completion
export const groqComplete = async (
    prompt,
    model = MODELS.FAST,
    maxTokens = 600
) => {
    const request = {
        model,
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
    };

    const response = await groq.chat.completions.create(request);

    return response.choices[0]?.message?.content?.trim() || "";
};

// Streaming completion
export const groqStream = async (
    prompt,
    onChunk,
    model = MODELS.FAST
) => {
    const stream = await groq.chat.completions.create({
        model,
        max_tokens: 400,
        temperature: 0.7,
        stream: true,
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
    });

    for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";

        if (text) {
            onChunk(text);
        }
    }
};

export default groq;