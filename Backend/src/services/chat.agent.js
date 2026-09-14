import { ChatGroq } from "@langchain/groq";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { getUserKundliTool, getHoroscopeTool } from "./chatTools.service.js";

const getSystemPrompt = (isHindi) => {
    const langRule = isHindi
        ? "CRITICAL LANGUAGE DIRECTIVE:\nYou MUST formulate and deliver your ENTIRE response strictly in Hindi language (हिंदी) using Devanagari script.\nDo NOT reply in English. Even if the user message or previous messages in the chat history are in English, the user has explicitly selected Hindi mode. Every heading, explanation, and remedy must be in Hindi."
        : "CRITICAL LANGUAGE DIRECTIVE:\nYou MUST formulate and deliver your ENTIRE response strictly in English language.\nDo NOT reply in Hindi or use Devanagari script. Even if the user message, transliterated Hindi (Hinglish), or previous messages in the chat history are in Hindi, the user has explicitly selected English mode. Formulate all planetary insights, interpretations, and advice entirely in English.";

    return `You are AstroAsk, an expert Vedic astrologer, cosmic counselor, and spiritual guide.

${langRule}

Your capabilities:
- Analyze birth charts (kundli), planetary placements, dashas, and yogas.
- Provide insightful horoscope readings (daily, weekly, monthly).
- Provide practical guidance on career, love, health, wealth, and destiny based on authentic Vedic astrology principles.
- Explain astrological shastra and concepts with clarity, depth, and empathy.

Guidelines:
- Always be warm, respectful, and encouraging.
- When birth details are provided or asked, interpret the houses, planets, signs, and dashas systematically.
- Use formatting: clear headings, bullet points, and markdown tables where comparing planets or houses.
- Never make fatalistic predictions; frame astrological insights as cosmic tendencies and provide constructive Vedic remedies (gemstones, mantras, mindfulness, rituals).
- Strictly adhere to the language specified above.`;
};

const sessionStore = new Map();

const getSessionHistory = (sessionId) => {
    if (!sessionStore.has(sessionId)) {
        sessionStore.set(sessionId, new InMemoryChatMessageHistory());
    }
    return sessionStore.get(sessionId);
};

export const loadSessionHistory = async (sessionId, messages) => {
    const history = getSessionHistory(sessionId);
    const existing = await history.getMessages();

    if (existing.length === 0 && messages?.length > 0) {
        for (const msg of messages) {
            if (msg.role === "user") {
                await history.addMessage(new HumanMessage(msg.content));
            } else {
                await history.addMessage(new AIMessage(msg.content));
            }
        }
    }
};

export const clearSessionHistory = (sessionId) => {
    sessionStore.delete(sessionId);
};

export const runAgentStream = async (sessionId, userMessage, userId, onChunk, lang = "en") => {
    const isHindi = lang === "hi" || lang?.toLowerCase()?.startsWith("hi");
    const systemPrompt = getSystemPrompt(isHindi);

    const llm = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "openai/gpt-oss-120b",
        temperature: 0.7,
        streaming: true,
    });

    const tools = [
        getUserKundliTool(userId),
        getHoroscopeTool(),
    ];

    const agent = createReactAgent({
        llm,
        tools,
        messageModifier: systemPrompt,
    });

    const agentWithHistory = new RunnableWithMessageHistory({
        runnable: agent,
        getMessageHistory: getSessionHistory,
        inputMessagesKey: "messages",
        historyMessagesKey: "chat_history",
    });

    let fullResponse = "";

    const stream = await agentWithHistory.stream(
        { messages: [new HumanMessage(userMessage)] },
        { configurable: { sessionId } }
    );

    for await (const chunk of stream) {
        if (chunk?.agent?.messages?.[0]?.content) {
            const text = chunk.agent.messages[0].content;
            if (typeof text === "string" && text) {
                fullResponse += text;
                onChunk(text);
            }
        }
    }

    return fullResponse;
};

export const generateChatTitle = async (userMessage, aiResponse = "", lang = "en") => {
    try {
        const cleanMsg = userMessage.replace(/^\[Language Instruction:[^\]]+\]\s*/i, "").trim();
        const isHindi = lang === "hi" || /[ऀ-ॿ]/.test(cleanMsg);

        const llm = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "openai/gpt-oss-20b",
            temperature: 0.3,
        });

        const prompt = isHindi
            ? "आप एक वैदिक ज्योतिष चैट के लिए शीर्षक बना रहे हैं। नीचे दिए गए प्रश्न और उत्तर का सार केवल 2 से 4 शब्दों में दें। कोई उद्धरण चिह्न या अतिरिक्त शब्द न लगाएं।\nप्रश्न: " + cleanMsg.slice(0, 100) + "\nउत्तर: " + aiResponse.slice(0, 100) + "\nकेवल 2-4 शब्दों का शीर्षक:"
            : "Summarize this Vedic astrology consultation into an elegant, extremely concise title of 2 to 4 words. Do not use quotes, punctuation, or prefixes like Title:.\nUser question: " + cleanMsg.slice(0, 100) + "\nAstrologer summary: " + aiResponse.slice(0, 100) + "\nTitle (2-4 words only):";

        const res = await llm.invoke(prompt);
        let title = typeof res?.content === "string" ? res.content.trim() : "";
        title = title.replace(/^[\"'`#*]+|[\"'`#*]+$/g, "").replace(/^title:\s*/i, "").trim();
        if (title && title.length >= 2 && title.length <= 40) {
            return title;
        }
    } catch (err) {
        console.error("AI title generation error:", err?.message);
    }

    const cleanMsg = userMessage.replace(/^\[Language Instruction:[^\]]+\]\s*/i, "").trim();
    if (cleanMsg.length <= 3) return "Cosmic Consultation";
    return cleanMsg.slice(0, 30);
};

export const runAgent = async (sessionId, userMessage, userId) => {
    const llm = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "openai/gpt-oss-20b",
        temperature: 0.3,
    });

    const tools = [
        getUserKundliTool(userId),
        getHoroscopeTool(),
    ];

    const agent = createReactAgent({ llm, tools, messageModifier: getSystemPrompt(false) });

    const agentWithHistory = new RunnableWithMessageHistory({
        runnable: agent,
        getMessageHistory: getSessionHistory,
        inputMessagesKey: "messages",
        historyMessagesKey: "chat_history",
    });

    const result = await agentWithHistory.invoke(
        { messages: [new HumanMessage(userMessage)] },
        { configurable: { sessionId } }
    );

    return result.messages.at(-1)?.content || "";
};