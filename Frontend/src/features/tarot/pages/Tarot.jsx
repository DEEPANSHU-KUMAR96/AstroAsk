import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Sparkles,
    RotateCcw,
    Copy,
    Check,
    AlertCircle,
    Flame,
    Droplets,
    Wind,
    Mountain,
    HelpCircle,
    Compass,
    Layers,
    ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../../../app/components/Navbar";
import useAuth from "../../auth/hooks/useAuth";
import { drawCardsStream } from "../services/tarotApi";

const SPREADS = [
    {
        key: "single",
        label: "Single Card",
        desc: "One card for instant daily guidance & clarity",
        count: 1,
        icon: "✨",
        positions: ["Present Guidance"],
    },
    {
        key: "three",
        label: "Three Card Spread",
        desc: "Past · Present · Future life trajectory",
        count: 3,
        icon: "🔮",
        positions: ["Past Influences", "Present Moment", "Future Trajectory"],
    },
    {
        key: "celtic",
        label: "Celtic Cross",
        desc: "Deep 10-card comprehensive spiritual diagnosis",
        count: 10,
        icon: "⭐",
        positions: [
            "Present",
            "Challenge",
            "Past Foundation",
            "Future Horizon",
            "Higher Self (Above)",
            "Subconscious (Below)",
            "Cosmic Advice",
            "External Influences",
            "Hopes & Fears",
            "Ultimate Outcome",
        ],
    },
];

const PROMPT_SUGGESTIONS = [
    "What energy should I embrace today?",
    "Where is my career path heading?",
    "What clarity do I need in love & relationships?",
    "What hidden obstacles should I be mindful of?",
];

/* ═══════════════════════════════════════════════════════
   MARKDOWN PARSER & RENDERER
   Renders **bold**, *italic*, `code`, # headings,
   - bullet lists, 1. numbered lists, | tables |, ---
═══════════════════════════════════════════════════════ */

function parseInline(str, keyPrefix = "") {
    if (!str) return null;
    const parts = [];
    const re = /(<br\s*\/?>|\*\*[\s\S]+?\*\*|\*[\s\S]+?\*|`[^`]+`)/gi;
    let last = 0, k = 0, m;
    while ((m = re.exec(str)) !== null) {
        if (m.index > last) parts.push(str.slice(last, m.index));
        const tok = m[0];
        if (tok.toLowerCase().startsWith("<br")) {
            parts.push(<br key={`${keyPrefix}-br${k++}`} />);
        } else if (tok.startsWith("**")) {
            parts.push(<strong key={`${keyPrefix}-b${k++}`} className="font-bold text-[#1a1a1a]">{tok.slice(2, -2)}</strong>);
        } else if (tok.startsWith("*")) {
            parts.push(<em key={`${keyPrefix}-i${k++}`} className="italic text-[#2b261f]">{tok.slice(1, -1)}</em>);
        } else if (tok.startsWith("`")) {
            parts.push(<code key={`${keyPrefix}-c${k++}`} className="px-1.5 py-0.5 rounded bg-[#fff9ed] text-[#7c5800] text-[11px] font-mono border border-[#ffb800]/20">{tok.slice(1, -1)}</code>);
        }
        last = re.lastIndex;
    }
    if (last < str.length) parts.push(str.slice(last));
    return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}

function isTableSep(line) {
    return /^\|?[\s\-:|]+\|?$/.test(line.trim());
}

function isTableRow(line) {
    const t = line.trim();
    return t.startsWith("|") && (t.endsWith("|") || t.includes("|"));
}

function renderTable(tableLines, key) {
    const rows = tableLines.filter((l) => !isTableSep(l));
    if (rows.length < 1) return null;
    const parse = (row) =>
        row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

    const [headers, ...body] = rows;
    const hdrs = parse(headers);
    return (
        <div key={key} className="overflow-hidden my-4 rounded-xl border border-[#ffb800]/30 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="bg-[#fff9ed] border-b border-[#ffb800]/25">
                            {hdrs.map((h, i) => (
                                <th key={i} className="px-3.5 py-2.5 font-bold text-[#7c5800] uppercase text-[10.5px] tracking-wider whitespace-nowrap">
                                    {parseInline(h, `th${key}${i}`)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(26,26,26,0.06)]">
                        {body.map((r, ri) => (
                            <tr key={ri} className={ri % 2 === 0 ? "bg-white hover:bg-[#fffdf7] transition-colors" : "bg-[#fafaf7] hover:bg-[#fffdf7] transition-colors"}>
                                {parse(r).map((c, ci) => (
                                    <td key={ci} className="px-3.5 py-2.5 text-[#2a2a2a] align-top leading-relaxed">
                                        {parseInline(c, `td${key}${ri}${ci}`)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const MarkdownContent = ({ text }) => {
    if (!text) return null;
    const lines = String(text).split("\n");
    const elems = [];
    let i = 0;
    let tableAccum = [];

    const flushTable = () => {
        if (tableAccum.length) {
            elems.push(renderTable(tableAccum, `tbl${i}`));
            tableAccum = [];
        }
    };

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // Table rows
        if (isTableRow(trimmed)) {
            tableAccum.push(trimmed);
            i++;
            continue;
        }
        if (tableAccum.length) flushTable();

        // Blank line
        if (!trimmed) {
            i++;
            continue;
        }

        // Horizontal divider
        if (/^-{2,}$/.test(trimmed) || /^\*{2,}$/.test(trimmed)) {
            elems.push(<hr key={`hr${i}`} className="my-4 border-[rgba(124,88,0,0.15)]" />);
            i++;
            continue;
        }

        // Headings (#, ##, ###)
        const hm = trimmed.match(/^(#{1,4})\s+(.*)/);
        if (hm) {
            const level = hm[1].length;
            const cn = level <= 2
                ? "text-[15px] font-bold text-[#1b1c1c] mt-4 mb-2 flex items-center gap-1.5 font-['Playfair_Display',Georgia,serif]"
                : "text-[13.5px] font-bold text-[#7c5800] mt-3.5 mb-1.5 flex items-center gap-1.5";
            elems.push(
                <div key={`h${i}`} className={cn}>
                    <span className="text-[#ffb800] text-xs">✦</span>
                    <span>{parseInline(hm[2], `hd${i}`)}</span>
                </div>
            );
            i++;
            continue;
        }

        // Bullet list
        if (/^[-•*]\s/.test(trimmed)) {
            const items = [];
            while (i < lines.length && /^[-•*]\s/.test(lines[i].trim())) {
                const itemText = lines[i].trim().replace(/^[-•*]\s/, "");
                items.push(
                    <li key={`li${i}`} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-[#ffb800] text-[10px] mt-1.5 shrink-0">✦</span>
                        <span className="text-[#2b261f]">{parseInline(itemText, `li${i}`)}</span>
                    </li>
                );
                i++;
            }
            elems.push(<ul key={`ul${i}`} className="space-y-1.5 my-2.5 pl-0.5">{items}</ul>);
            continue;
        }

        // Numbered list
        if (/^\d+[.)]\s/.test(trimmed)) {
            const items = [];
            while (i < lines.length && /^\d+[.)]\s/.test(lines[i].trim())) {
                const itemNum = lines[i].trim().match(/^(\d+)[.)]\s/)[1];
                const itemText = lines[i].trim().replace(/^\d+[.)]\s/, "");
                items.push(
                    <li key={`oli${i}`} className="flex items-start gap-2 leading-relaxed">
                        <span className="font-bold text-[#7c5800] text-[11px] min-w-[18px] mt-0.5 shrink-0">{itemNum}.</span>
                        <span className="text-[#2b261f]">{parseInline(itemText, `oli${i}`)}</span>
                    </li>
                );
                i++;
            }
            elems.push(<ol key={`ol${i}`} className="space-y-1.5 my-2.5 pl-0.5">{items}</ol>);
            continue;
        }

        // Regular line
        elems.push(
            <p key={`p${i}`} className="leading-[1.75] mb-2 text-[#2b261f]">
                {parseInline(trimmed, `p${i}`)}
            </p>
        );
        i++;
    }
    flushTable();

    return <div className="space-y-1">{elems}</div>;
};

const ELEMENT_STYLES = {
    Fire: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-700",
        icon: Flame,
    },
    Water: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-700",
        icon: Droplets,
    },
    Air: {
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        text: "text-purple-700",
        icon: Wind,
    },
    Earth: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-700",
        icon: Mountain,
    },
    default: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-[#7c5800]",
        icon: Sparkles,
    },
};

const CardDisplay = ({ card, position }) => {
    const elem = card.element ? ELEMENT_STYLES[card.element] || ELEMENT_STYLES.default : ELEMENT_STYLES.default;
    const ElemIcon = elem.icon;

    return (
        <div className="bg-white border border-[rgba(124,88,0,0.15)] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(124,88,0,0.08)] transition-all flex flex-col justify-between relative overflow-hidden group">
            {/* Top celestial accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffb800]/60 to-transparent" />

            <div>
                {/* Position header */}
                <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[rgba(26,26,26,0.06)]">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#7c5800]">
                        {position || "Tarot Guidance"}
                    </span>
                    {card.element && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${elem.bg} ${elem.text} ${elem.border} border`}>
                            <ElemIcon size={11} />
                            {card.element}
                        </span>
                    )}
                </div>

                {/* Card artwork face */}
                <div className="relative my-3 p-5 rounded-xl border border-[rgba(124,88,0,0.2)] bg-gradient-to-b from-[#fffdf8] to-[#fbf7ee] text-center shadow-inner group-hover:border-[#ffb800] transition-colors">
                    {/* Tarot card glyph */}
                    <div className="text-4xl sm:text-5xl mb-3 inline-block select-none">
                        🃏
                    </div>

                    <h4 className="font-['Playfair_Display',Georgia,serif] text-base sm:text-lg font-bold text-[#1b1c1c] tracking-wide">
                        {card.name}
                    </h4>

                    {/* Upright vs Reversed Tag */}
                    <div className="mt-2.5 flex justify-center">
                        <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${card.isReversed
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-[#fff9ed] text-[#7c5800] border-[#ffb800]/40"
                                }`}
                        >
                            {card.isReversed ? "🔄 Reversed" : "✨ Upright"}
                        </span>
                    </div>
                </div>

                {/* Arcana / Suit Info */}
                <div className="flex items-center justify-between text-[11px] text-[#5f5e5e] mb-3 px-1">
                    <span className="capitalize font-medium">
                        {card.arcana === "major" ? "Major Arcana" : `${card.suit || "Minor Arcana"}`}
                    </span>
                    {card.id !== undefined && (
                        <span className="text-[10px] text-[#8e8d8d] uppercase tracking-wider">
                            Card #{card.id}
                        </span>
                    )}
                </div>

                {/* Keywords */}
                {card.keywords && card.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {card.keywords.slice(0, 3).map((k) => (
                            <span
                                key={k}
                                className="text-[10px] text-[#5f5e5e] bg-[#f4ece1]/60 px-2.5 py-0.5 rounded-md border border-[rgba(124,88,0,0.08)] capitalize"
                            >
                                {k}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function TarotPage() {
    const { isAuthenticated, user } = useAuth();

    // Language synchronization with local storage
    const [lang, setLang] = useState(() => localStorage.getItem("astro_lang") || "en");
    const [selectedSpread, setSelectedSpread] = useState("single");
    const [question, setQuestion] = useState("");

    const [cards, setCards] = useState([]);
    const [spreadName, setSpreadName] = useState("");
    const [streamingText, setStreamingText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [phase, setPhase] = useState("select"); // "select" | "result"
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        localStorage.setItem("astro_lang", lang);
    }, [lang]);

    const activeSpreadConfig = SPREADS.find((s) => s.key === selectedSpread) || SPREADS[0];

    const handleDraw = async () => {
        if (isLoading || isStreaming) return;

        if (!isAuthenticated) {
            toast.error("Please sign in to draw tarot cards & receive readings.");
            return;
        }

        setError(null);
        setCards([]);
        setStreamingText("");
        setIsLoading(true);
        setPhase("result");

        await drawCardsStream(
            selectedSpread,
            question,
            lang,
            (drawnCards, name) => {
                setCards(drawnCards || []);
                setSpreadName(name || activeSpreadConfig.label);
                setIsLoading(false);
                setIsStreaming(true);
            },
            (chunk) => {
                setStreamingText((prev) => prev + chunk);
            },
            () => {
                setIsStreaming(false);
                setIsLoading(false);
            },
            (err) => {
                setError(err);
                setIsLoading(false);
                setIsStreaming(false);
                toast.error(err || "Failed to draw tarot cards");
            }
        );
    };

    const handleReset = () => {
        setPhase("select");
        setCards([]);
        setStreamingText("");
        setError(null);
    };

    const handleCopyReading = () => {
        if (!streamingText) return;
        navigator.clipboard.writeText(streamingText);
        setCopied(true);
        toast.success("Reading copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#fbf9f8] text-[#1b1c1c] font-['Inter',sans-serif] selection:bg-[#ffb800] selection:text-[#1a1a1a]">
            {/* Global Navbar */}
            <Navbar lang={lang} onLangChange={setLang} />

            {/* Main Container */}
            <main className="grow w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pt-24 md:pt-28 pb-20">

                {/* Authentication Banner */}
                {!isAuthenticated && (
                    <div className="mb-8 p-6 bg-[#fff9ed] border border-[#ffb800]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                        <div>
                            <h3 className="font-['Playfair_Display',Georgia,serif] text-lg font-bold text-[#7c5800]">
                                Sign in for Tarot Readings
                            </h3>
                            <p className="text-xs text-[#5f5e5e] mt-1">
                                Unlock personalized AI interpretations, multiple celestial spreads, and unlimited tarot guidance.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                to="/login"
                                className="px-5 py-2 rounded-full border border-[#7c5800] text-[#7c5800] text-xs font-semibold uppercase tracking-wider hover:bg-[#7c5800] hover:text-white transition"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-5 py-2 rounded-full bg-[#ffb800] text-[#6b4c00] text-xs font-bold uppercase tracking-wider hover:bg-[#ffba20] transition shadow-sm"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fff9ed] border border-[#ffb800]/40 text-[#7c5800] text-xs font-semibold uppercase tracking-widest mb-3">
                        <Sparkles size={13} className="text-[#ffb800]" />
                        Vedic & Western Arcana
                    </div>
                    <h1 className="font-['Playfair_Display',Georgia,serif] text-3xl sm:text-4xl md:text-5xl font-bold text-[#1b1c1c] tracking-tight">
                        Tarot Oracle & Insights
                    </h1>
                    <p className="text-[#5f5e5e] mt-3 text-sm sm:text-base leading-relaxed">
                        Channel cosmic wisdom. Focus on your query, choose an ancient spread, and receive deep spiritual guidance.
                    </p>
                </div>

                {/* SELECT SPREAD & QUESTION PHASE */}
                {phase === "select" && (
                    <div className="max-w-2xl mx-auto space-y-8">
                        {/* Spread Selection */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#7c5800] mb-3">
                                1. Choose Your Spread
                            </label>
                            <div className="grid sm:grid-cols-3 gap-3.5">
                                {SPREADS.map((s) => {
                                    const isSelected = selectedSpread === s.key;
                                    return (
                                        <button
                                            key={s.key}
                                            type="button"
                                            onClick={() => setSelectedSpread(s.key)}
                                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${isSelected
                                                ? "border-[#ffb800] bg-[#fff9ed] shadow-[0_4px_20px_rgba(255,184,0,0.15)] ring-1 ring-[#ffb800]"
                                                : "border-[rgba(26,26,26,0.1)] bg-white hover:border-[#ffb800]/50 hover:bg-[#fdfcf9]"
                                                }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-2xl">{s.icon}</span>
                                                    <span
                                                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isSelected
                                                            ? "bg-[#ffb800] text-[#6b4c00]"
                                                            : "bg-[#f4ece1] text-[#7c5800]"
                                                            }`}
                                                    >
                                                        {s.count} {s.count === 1 ? "card" : "cards"}
                                                    </span>
                                                </div>
                                                <h3 className="font-['Playfair_Display',Georgia,serif] font-bold text-sm text-[#1b1c1c]">
                                                    {s.label}
                                                </h3>
                                                <p className="text-xs text-[#5f5e5e] mt-1 leading-snug">
                                                    {s.desc}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Question Input */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#7c5800]">
                                    2. Your Question / Focus <span className="text-[#8e8d8d] font-normal lowercase">(optional)</span>
                                </label>
                                {question && (
                                    <button
                                        type="button"
                                        onClick={() => setQuestion("")}
                                        className="text-[11px] text-[#8e8d8d] hover:text-[#7c5800] transition"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="e.g. What spiritual path should I embrace right now?"
                                    className="w-full bg-white border border-[rgba(26,26,26,0.12)] rounded-xl px-4 py-3.5 text-sm text-[#1b1c1c] placeholder-[#8e8d8d] focus:outline-none focus:border-[#ffb800] focus:ring-2 focus:ring-[#ffb800]/20 shadow-sm transition"
                                />
                            </div>

                            {/* Prompt suggestion pills */}
                            <div className="mt-3">
                                <p className="text-[11px] text-[#8e8d8d] mb-1.5 flex items-center gap-1">
                                    <HelpCircle size={12} /> Popular Inquiries:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {PROMPT_SUGGESTIONS.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setQuestion(item)}
                                            className="text-xs bg-white hover:bg-[#fff9ed] hover:border-[#ffb800]/60 border border-[rgba(26,26,26,0.08)] px-3 py-1 rounded-full text-[#5f5e5e] hover:text-[#7c5800] transition cursor-pointer"
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Draw Action Button */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleDraw}
                                className="w-full bg-[#ffb800] hover:bg-[#ffba20] text-[#6b4c00] font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(255,184,0,0.3)] hover:shadow-[0_6px_24px_rgba(255,184,0,0.4)] transition-all active:scale-[0.99] text-base flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Sparkles size={18} />
                                Draw {activeSpreadConfig.label} ({activeSpreadConfig.count} {activeSpreadConfig.count === 1 ? "Card" : "Cards"})
                            </button>
                            <p className="text-center text-[11px] text-[#8e8d8d] mt-2">
                                Each card is drawn randomly with upright/reversed orientations and analyzed by our Vedic AI.
                            </p>
                        </div>
                    </div>
                )}

                {/* RESULT PHASE */}
                {phase === "result" && (
                    <div className="space-y-8">
                        {/* Top action controls */}
                        <div className="flex items-center justify-between pb-4 border-b border-[rgba(26,26,26,0.08)]">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7c5800] hover:text-[#ffb800] transition cursor-pointer"
                            >
                                <RotateCcw size={14} />
                                New Reading
                            </button>

                            {spreadName && (
                                <div className="text-center">
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#7c5800]">
                                        {spreadName}
                                    </span>
                                    {question && (
                                        <p className="text-xs text-[#5f5e5e] italic max-w-md truncate">
                                            "{question}"
                                        </p>
                                    )}
                                </div>
                            )}

                            {!isLoading && !isStreaming && (
                                <button
                                    type="button"
                                    onClick={handleDraw}
                                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#7c5800] hover:underline cursor-pointer"
                                >
                                    Re-draw ✨
                                </button>
                            )}
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <div className="grow text-xs">
                                    <p className="font-bold text-sm">Unable to complete reading</p>
                                    <p className="mt-0.5">{error}</p>
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleDraw}
                                            className="px-3 py-1 bg-rose-700 text-white rounded-md font-semibold hover:bg-rose-800 transition"
                                        >
                                            Try Again
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="px-3 py-1 border border-rose-300 rounded-md font-semibold hover:bg-rose-100 transition"
                                        >
                                            Change Spread
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loading / Shuffling Animation */}
                        {isLoading && (
                            <div className="py-20 text-center space-y-4">
                                <div className="relative inline-block">
                                    <div className="text-5xl animate-bounce">🔮</div>
                                    <div className="absolute -inset-4 bg-[#ffb800]/20 rounded-full blur-xl animate-pulse -z-10" />
                                </div>
                                <h3 className="font-['Playfair_Display',Georgia,serif] text-xl font-bold text-[#7c5800]">
                                    Shuffling the Tarot Deck...
                                </h3>
                                <p className="text-xs text-[#5f5e5e] max-w-sm mx-auto">
                                    Aligning spiritual energies and tuning into cosmic archetypes for your query.
                                </p>
                            </div>
                        )}

                        {/* Cards Grid */}
                        {cards.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-['Playfair_Display',Georgia,serif] text-lg font-bold text-[#1b1c1c] flex items-center gap-2">
                                        <Layers size={18} className="text-[#ffb800]" />
                                        Cards Drawn
                                    </h3>
                                    <span className="text-xs text-[#5f5e5e]">
                                        {cards.length} {cards.length === 1 ? "Card" : "Cards"} Total
                                    </span>
                                </div>

                                <div
                                    className={`grid gap-4 ${cards.length === 1
                                        ? "max-w-xs mx-auto"
                                        : cards.length === 3
                                            ? "grid-cols-1 sm:grid-cols-3"
                                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                                        }`}
                                >
                                    {cards.map((card, i) => {
                                        const posLabel =
                                            card.position ||
                                            activeSpreadConfig.positions[i] ||
                                            `Card #${i + 1}`;
                                        return (
                                            <CardDisplay
                                                key={`${card.name}-${i}`}
                                                card={card}
                                                position={posLabel}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* AI Cosmic Consultation Chat Stream */}
                        {(streamingText || isStreaming) && (
                            <div className="space-y-4 pt-2">
                                {/* User Query Chat Bubble (if user entered a question) */}
                                {question && (
                                    <div className="flex items-end justify-end gap-2.5">
                                        <div className="flex flex-col items-end gap-1 max-w-[85%] sm:max-w-[75%]">
                                            <div className="bg-[#1f1e1d] text-[#fbfaf8] text-[13px] sm:text-[13.5px] leading-relaxed px-4 py-3 rounded-[20px] rounded-br-[4px] shadow-sm break-words">
                                                {question}
                                            </div>
                                            <span className="text-[10px] text-[#8e8d8d] pr-1">
                                                Query for {spreadName || activeSpreadConfig.label}
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#5b21b6] text-white text-xs sm:text-[13px] font-bold flex items-center justify-center shrink-0 shadow-sm select-none mb-1">
                                            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                                        </div>
                                    </div>
                                )}

                                {/* AI Tarot Oracle Chat Bubble */}
                                <div className="flex items-start gap-2.5 sm:gap-3.5">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#ffb800] to-[#f59e0b] text-[#5c3d00] text-sm sm:text-[15px] font-bold flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(255,184,0,0.3)] select-none mt-1">
                                        ✦
                                    </div>
                                    <div className="flex-1 max-w-[95%] sm:max-w-[90%] bg-white rounded-[22px] rounded-tl-[6px] border border-[#ffb800]/25 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
                                        {/* Chat Message Header */}
                                        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b border-[#ffb800]/15 bg-[#fffdf9]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs sm:text-[13px] font-bold text-[#7c5800]">
                                                    AstroAsk Tarot Oracle
                                                </span>
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-semibold text-[#8e8d8d] bg-[#f4ece1]/70 px-2.5 py-0.5 rounded-full border border-[rgba(124,88,0,0.12)]">
                                                    {lang === "hi" ? "वैदिक टैरो वाचन" : "Vedic Arcana Reading"}
                                                </span>
                                            </div>

                                            {streamingText && (
                                                <button
                                                    type="button"
                                                    onClick={handleCopyReading}
                                                    className="text-xs text-[#7c5800] hover:text-[#1b1c1c] px-2.5 py-1 rounded-lg hover:bg-[#f4ece1]/60 transition flex items-center gap-1.5 cursor-pointer"
                                                    title="Copy reading"
                                                >
                                                    {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                                    <span className="text-[11px] font-medium">{copied ? "Copied" : "Copy"}</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Formatted Markdown Chat Message */}
                                        <div className="p-4 sm:p-6 text-sm text-[#2b261f] leading-relaxed">
                                            <MarkdownContent text={streamingText} />
                                            {isStreaming && (
                                                <span className="inline-block w-2 h-4 bg-[#ffb800] ml-1.5 animate-pulse rounded-sm align-middle" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Bar when reading completes */}
                        {!isLoading && !isStreaming && cards.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleDraw}
                                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#ffb800] hover:bg-[#ffba20] text-[#6b4c00] font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
                                >
                                    Draw Again ✨
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="w-full sm:w-auto px-6 py-3 rounded-full border border-[rgba(26,26,26,0.15)] hover:border-[#7c5800] text-[#1b1c1c] font-semibold text-xs uppercase tracking-wider transition cursor-pointer"
                                >
                                    Choose Another Spread
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
