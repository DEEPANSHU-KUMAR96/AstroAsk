import { ChatGroq } from "@langchain/groq";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { getUserKundliTool, getHoroscopeTool } from "./chatTools.service.js";

const SYSTEM_PROMPT = `You are AstroAsk an expert Vedic astrologer and spiritual guide.

Your capabilities:
- Analyze birth charts (kundli) and planetary positions
- Provide horoscope readings (daily, weekly, monthly)
- Give guidance on career, love, health, and finances based on astrology
- Explain Vedic astrology concepts in simple language

Guidelines:
- Always be warm, empathetic, and encouraging
- Use astrology tools when user asks about their chart or horoscope
- If user speaks Hindi, respond in Hindi
- Keep responses focused and practical
- Never make definitive predictions or give frame insights as cosmic guidance`;

// In-memory session store (use Redis in production)
const sessionStore = new Map();

const getSessionHistory = (sessionId) => {
    if (!sessionStore.has(sessionId)) {
        sessionStore.set(sessionId, new InMemoryChatMessageHistory());
    }
    return sessionStore.get(sessionId);
};

// Preload existing messages from DB into memory
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

// Clear session from memory (on logout or session delete)
export const clearSessionHistory = (sessionId) => {
    sessionStore.delete(sessionId);
};

// Main agent — streaming
export const runAgentStream = async (sessionId, userMessage, userId, onChunk) => {
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
        messageModifier: SYSTEM_PROMPT,
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
        // Agent streams multiple event types — only send text chunks
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

// Non-streaming version (for title generation)
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

    const agent = createReactAgent({ llm, tools, messageModifier: SYSTEM_PROMPT });

    const agentWithHistory = new RunnableWithMessageHistory({
        runnable: agent,
        getMessageHistory: getSessionHistory,
        inputMessagesKey: "messages",
        historyMessagesKey: "chat_history",
    });

    const result = await agentWithHistory.invoke(
        {
             messages: [new HumanMessage(userMessage)] 
            },
        {
             configurable: { sessionId } 
            }
    );

    return result.messages.at(-1)?.content || "";
};