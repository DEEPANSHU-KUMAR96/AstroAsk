import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare, Plus, Trash2, Send, Sparkles, Menu, X } from "lucide-react";
import Navbar from "../../../app/components/Navbar";
import useChat from "../hooks/useChat";

/* ─── Message Bubble ────── */
const Message = ({ msg }) => {
    const isUser = msg.role === "user";
    return (
        <div className={`flex gap-2.5 sm:gap-3 items-end ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar */}
            <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold shadow-sm
                ${isUser
                        ? "bg-[#ffb800] text-[#6b4c00] border border-[#e6a500]"
                        : "bg-[#7c5800] text-[#ffe9a0] border border-[#5a3f00]"
                    }`}
            >
                {isUser ? "U" : "✨"}
            </div>

            {/* Bubble */}
            <div
                className={`max-w-[86%] sm:max-w-[72%] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                ${isUser
                        ? "bg-[#ffb800] text-[#3a2800] font-medium rounded-br-sm"
                        : "bg-white border border-[rgba(26,26,26,0.1)] text-[#1b1c1c] rounded-bl-sm"
                    }`}
            >
                <p className="whitespace-pre-wrap wrap-break-word">{msg.content}</p>
            </div>
        </div>
    );
};

/* ─── Streaming Bubble ──────── */
const StreamingMessage = ({ text }) => (
    <div className="flex gap-2.5 sm:gap-3 items-end flex-row">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#7c5800] text-[#ffe9a0] border border-[#5a3f00] flex items-center justify-center shrink-0 text-[11px] font-bold shadow-sm">
            ✨
        </div>
        <div className="max-w-[86%] sm:max-w-[72%] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl rounded-bl-sm bg-white border border-[rgba(26,26,26,0.1)] text-[#1b1c1c] text-sm leading-relaxed shadow-sm">
            <p className="whitespace-pre-wrap wrap-break-word inline">
                {text}
                <span className="inline-block w-1.5 h-4 bg-[#ffb800] ml-1 animate-pulse rounded-sm align-middle" />
            </p>
        </div>
    </div>
);

/* ─── Empty State ──────────── */
const EmptyState = ({ onNew }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-90 gap-5 text-center px-4 py-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#fff9ed] border-2 border-[#ffb800]/30 flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
            🔮
        </div>
        <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1b1c1c] font-['Playfair_Display',Georgia,serif]">
                AstroAsk AI
            </h2>
            <p className="text-[#5f5e5e] text-xs sm:text-sm max-w-sm mt-1.5 leading-relaxed">
                Ask anything about your birth chart, horoscope, career, love, or Vedic life path.
            </p>
        </div>

        {/* Suggestion Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md mt-1">
            {[
                "Mera career kaisa rahega?",
                "Aaj ka Aries horoscope batao",
                "Mera strongest planet kaunsa hai?",
                "Love life ke baare mein batao",
            ].map((q) => (
                <button
                    key={q}
                    onClick={() => onNew(q)}
                    className="text-left text-xs text-[#5f5e5e] bg-[#fdfcf9] border border-[rgba(26,26,26,0.1)] hover:border-[#ffb800]/60 hover:text-[#7c5800] hover:bg-[#fff9ed] rounded-xl p-3 transition-all duration-200 shadow-sm"
                >
                    {q}
                </button>
            ))}
        </div>
    </div>
);

/* ─── Sidebar ─────────────── */
const Sidebar = ({ sessions, activeId, onSelect, onNew, onDelete, loading, mobileOpen, onCloseMobile }) => (
    <>
        {/* Mobile Backdrop */}
        {mobileOpen && (
            <div
                onClick={onCloseMobile}
                className="fixed inset-0 bg-[rgba(26,26,26,0.45)] z-30 md:hidden backdrop-blur-sm"
                aria-hidden="true"
            />
        )}

        <aside
            className={`
                fixed md:static inset-y-0 left-0 z-40
                w-72 md:w-64 lg:w-72
                bg-[#fdfcf9] border-r border-[rgba(26,26,26,0.1)]
                flex flex-col
                pt-16 md:pt-0
                transform transition-transform duration-250 ease-in-out
                md:translate-x-0
                ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
            `}
        >
            {/* Sidebar Header */}
            <div className="px-4 py-4 border-b border-[rgba(26,26,26,0.08)] flex items-center gap-2">
                <button
                    id="new-chat-btn"
                    onClick={() => { onNew(); onCloseMobile?.(); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#ffb800] hover:bg-[#ffba20] active:scale-[0.97] text-[#6b4c00] font-bold py-2.5 px-3 rounded-xl text-[11px] uppercase tracking-wider transition-all duration-200 shadow-sm"
                >
                    <Plus size={14} />
                    New Chat
                </button>
                <button
                    onClick={onCloseMobile}
                    className="md:hidden p-2 text-[#5f5e5e] hover:text-[#1b1c1c] hover:bg-[#f4ece1]/60 rounded-lg transition-colors"
                    aria-label="Close sidebar"
                >
                    <X size={17} />
                </button>
            </div>

            {/* Label */}
            <div className="px-4 pt-4 pb-1.5">
                <span className="text-[9px] uppercase tracking-[0.18em] font-semibold text-[#5f5e5e]/70">
                    Recent Consultations
                </span>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
                {loading && (
                    <p className="text-center text-[#5f5e5e] text-xs py-6">Loading chats...</p>
                )}
                {!loading && sessions.length === 0 && (
                    <div className="text-center py-10 px-4 text-[#5f5e5e]">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-25" />
                        <p className="text-xs">No chats yet.<br />Start a new consultation!</p>
                    </div>
                )}
                {sessions.map((s) => (
                    <div
                        key={s._id}
                        onClick={() => { onSelect(s._id); onCloseMobile?.(); }}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150
                            ${activeId === s._id
                                ? "bg-[#fff9ed] border border-[#ffb800]/40 text-[#7c5800]"
                                : "text-[#5f5e5e] hover:bg-[#f4ece1]/60 border border-transparent hover:text-[#7c5800]"
                            }
                        `}
                    >
                        <span className="text-xs font-medium truncate flex-1 leading-tight">
                            {s.title || "New Consultation"}
                        </span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(s._id); }}
                            className="opacity-0 group-hover:opacity-100 text-[#5f5e5e]/50 hover:text-red-500 transition-all p-1 ml-1 rounded-md hover:bg-red-50 shrink-0"
                            title="Delete chat"
                            aria-label="Delete chat"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
            </div>
        </aside>
    </>
);

/* ─── Chat Page ─────────────── */
export default function ChatPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        sessions,
        activeSession,
        streamingText,
        isStreaming,
        loading,
        handleFetchSessions,
        handleSelectSession,
        handleSendMessage,
        handleNewChat,
        handleDeleteSession,
    } = useChat();

    const [input, setInput] = useState("");
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const bottomRef = useRef(null);
    const textareaRef = useRef(null);

    /* ── Initial session load ── */
    useEffect(() => {
        handleFetchSessions();
    }, []);

    /* ── Sync URL param → active session ── */
    useEffect(() => {
        if (id && (!activeSession || activeSession._id !== id)) {
            handleSelectSession(id);
        }
    }, [id]);

    /* ── Auto-scroll ── */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeSession?.messages, streamingText]);

    /* ── Auto-resize textarea ── */
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
    }, [input]);

    /* ── Handlers ── */
    const handleSelectChat = (sessionId) => {
        handleSelectSession(sessionId);
        navigate(`/chat/${sessionId}`);
    };

    const handleStartNewChat = async () => {
        const session = await handleNewChat();
        navigate(session?._id ? `/chat/${session._id}` : "/chat");
    };

    const onSend = async (text) => {
        const msg = (text ?? input).trim();
        if (!msg || isStreaming) return;
        setInput("");

        let targetId = activeSession?._id;

        if (!targetId) {
            const newSession = await handleNewChat();
            if (newSession?._id) {
                targetId = newSession._id;
                navigate(`/chat/${targetId}`);
            } else return;
        }

        handleSendMessage(msg, targetId);
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    const messages = activeSession?.messages || [];

    /* ──────────── RENDER ──────────── */
    return (
        <div className="h-screen bg-[#fbf9f8] flex flex-col overflow-hidden font-['Inter',sans-serif] text-[#1b1c1c] selection:bg-[#ffb800] selection:text-[#1a1a1a]">
            {/* ── Navbar ── */}
            <Navbar />

            {/* ── Body (below fixed navbar) ── */}
            <div className="flex flex-1 overflow-hidden pt-14.25 md:pt-16.25">

                {/* ── Sidebar ── */}
                <Sidebar
                    sessions={sessions}
                    activeId={activeSession?._id}
                    onSelect={handleSelectChat}
                    onNew={handleStartNewChat}
                    onDelete={handleDeleteSession}
                    loading={loading}
                    mobileOpen={mobileSidebarOpen}
                    onCloseMobile={() => setMobileSidebarOpen(false)}
                />

                {/* ── Main Chat Column ── */}
                <main className="flex-1 flex flex-col h-full bg-[#fbf9f8] overflow-hidden">

                    {/* ── Chat Sub-Header ── */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[rgba(26,26,26,0.08)] bg-[#fdfcf9]/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] shrink-0">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            {/* Mobile hamburger */}
                            <button
                                id="open-sidebar-btn"
                                onClick={() => setMobileSidebarOpen(true)}
                                className="md:hidden p-1.5 text-[#5f5e5e] hover:text-[#7c5800] hover:bg-[#f4ece1] rounded-lg transition-colors shrink-0"
                                aria-label="Open chat history"
                            >
                                <Menu size={18} />
                            </button>

                            {/* Icon */}
                            <div className="w-8 h-8 rounded-full bg-[#fff9ed] border border-[#ffb800]/40 flex items-center justify-center shrink-0 shadow-inner">
                                <Sparkles className="w-4 h-4 text-[#7c5800]" />
                            </div>

                            {/* Title */}
                            <div className="min-w-0">
                                <h1 className="text-sm font-semibold text-[#1b1c1c] truncate leading-tight">
                                    {activeSession?.title || "AstroAsk AI Consultation"}
                                </h1>
                                <p className="text-[10px] text-[#5f5e5e] truncate">Vedic Astrology &amp; Planetary Guidance</p>
                            </div>
                        </div>

                        {/* Streaming indicator */}
                        {isStreaming && (
                            <div className="flex items-center gap-1.5 text-[11px] text-[#7c5800] font-semibold shrink-0 ml-2">
                                <span className="w-2 h-2 rounded-full bg-[#ffb800] animate-ping" />
                                <span className="hidden sm:inline">Consulting planets...</span>
                            </div>
                        )}
                    </div>

                    {/* ── Messages ── */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 lg:px-20 py-6 space-y-4">
                        {messages.length === 0 && !isStreaming ? (
                            <EmptyState onNew={onSend} />
                        ) : (
                            <>
                                {messages.map((msg, i) => (
                                    <Message key={i} msg={msg} />
                                ))}
                                {isStreaming && streamingText && (
                                    <StreamingMessage text={streamingText} />
                                )}
                            </>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* ── Input Area ── */}
                    <div className="shrink-0 px-3 sm:px-6 py-3 sm:py-4 border-t border-[rgba(26,26,26,0.08)] bg-[#fdfcf9]/95 backdrop-blur-md shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
                        <div className="max-w-3xl mx-auto">
                            <div className="flex gap-2 sm:gap-3 items-end bg-white border border-[rgba(26,26,26,0.12)] rounded-2xl px-3 sm:px-4 py-2.5 shadow-sm focus-within:border-[#ffb800]/70 focus-within:shadow-[0_0_0_3px_rgba(255,184,0,0.12)] transition-all duration-200">
                                <textarea
                                    id="chat-input"
                                    ref={textareaRef}
                                    rows={1}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    placeholder="Ask about your kundli, career, planets, relationships..."
                                    disabled={isStreaming}
                                    className="flex-1 bg-transparent text-[#1b1c1c] text-xs sm:text-sm placeholder-[#5f5e5e]/60 resize-none focus:outline-none disabled:opacity-50 py-1 leading-relaxed max-h-32 min-h-5.5"
                                />
                                <button
                                    id="send-message-btn"
                                    onClick={() => onSend()}
                                    disabled={!input.trim() || isStreaming}
                                    className="bg-[#ffb800] hover:bg-[#ffba20] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-[#6b4c00] p-2 sm:p-2.5 rounded-xl transition-all duration-200 shrink-0 shadow-sm cursor-pointer"
                                    aria-label="Send message"
                                >
                                    <Send size={15} />
                                </button>
                            </div>
                            <p className="text-[10px] text-[#5f5e5e]/60 text-center mt-1.5 hidden sm:block">
                                Press <kbd className="font-medium">Enter</kbd> to send &middot; <kbd className="font-medium">Shift+Enter</kbd> for new line
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}