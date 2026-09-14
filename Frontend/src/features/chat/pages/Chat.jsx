import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Plus, Trash2, Send, Sparkles, Menu,
    Paperclip, Mic, X, Image as ImageIcon,
    Briefcase, Star, Zap, Heart, MessageSquare, Users,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../../../app/components/Navbar";
import useChat from "../hooks/useChat";
import useAuth from "../../auth/hooks/useAuth";

/* ═══════════════════════════════════════════════════════
   MARKDOWN RENDERER
   Handles: **bold**, *italic*, `code`, # headings,
   - lists, | tables |, <br>, ---, paragraphs
═══════════════════════════════════════════════════════ */

function cleanMsgText(str) {
    if (!str) return "";
    return String(str).replace(/^\[Language Instruction:[^\]]+\]\s*/i, "").trim();
}

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
            parts.push(<em key={`${keyPrefix}-i${k++}`} className="italic">{tok.slice(1, -1)}</em>);
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
    const rows = tableLines.filter(l => !isTableSep(l));
    if (rows.length < 1) return null;
    const parse = row =>
        row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());

    const [headers, ...body] = rows;
    const hdrs = parse(headers);
    return (
        <div key={key} className="overflow-hidden my-3.5 rounded-xl border border-[#ffb800]/25 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-[12.5px] border-collapse">
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
                                        {ci === 0 && (c.includes("राशि") || c.includes("लग्न") || c.includes("ग्रह") || c.includes("दशा") || c.includes("तत्व") || c.includes("Sun") || c.includes("Moon") || c.includes("Ascendant")) ? (
                                            <span className="flex items-center gap-1.5 font-semibold text-[#1a1a1a]">
                                                <span className="text-[#ffb800] text-[10px]">✦</span>
                                                {parseInline(c, `td${key}${ri}${ci}`)}
                                            </span>
                                        ) : (
                                            parseInline(c, `td${key}${ri}${ci}`)
                                        )}
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
            elems.push(<hr key={`hr${i}`} className="my-3 border-[rgba(26,26,26,0.1)]" />);
            i++;
            continue;
        }

        // Headings
        const hm = trimmed.match(/^(#{1,3})\s+(.*)/);
        if (hm) {
            const level = hm[1].length;
            const cn = level === 1
                ? "text-[15px] font-bold text-[#1a1a1a] mt-3.5 mb-1.5 flex items-center gap-1.5"
                : level === 2
                    ? "text-[14px] font-bold text-[#1a1a1a] mt-3 mb-1 flex items-center gap-1.5"
                    : "text-[13px] font-bold text-[#7c5800] mt-2.5 mb-1";
            elems.push(
                <div key={`h${i}`} className={cn}>
                    {level <= 2 && <span className="text-[#ffb800] text-[12px]">✦</span>}
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
                        <span className="text-[#ffb800] text-[10px] mt-1 shrink-0">✦</span>
                        <span>{parseInline(itemText, `li${i}`)}</span>
                    </li>
                );
                i++;
            }
            elems.push(<ul key={`ul${i}`} className="space-y-1.5 my-2 pl-0.5">{items}</ul>);
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
                        <span>{parseInline(itemText, `oli${i}`)}</span>
                    </li>
                );
                i++;
            }
            elems.push(<ol key={`ol${i}`} className="space-y-1.5 my-2 pl-0.5">{items}</ol>);
            continue;
        }

        // Regular line
        elems.push(
            <p key={`p${i}`} className="leading-[1.75] mb-1.5 text-[#1a1a1a]">
                {parseInline(trimmed, `p${i}`)}
            </p>
        );
        i++;
    }
    flushTable();

    return <div className="space-y-0.5">{elems}</div>;
};

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */

const sessionTimeLabel = (raw) => {
    if (!raw) return "";
    const now = new Date(), d = new Date(raw);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yestStart = new Date(todayStart); yestStart.setDate(yestStart.getDate() - 1);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (day >= todayStart) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    if (day >= yestStart) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

function groupSessions(sessions) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yestStart = new Date(todayStart); yestStart.setDate(yestStart.getDate() - 1);
    const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);
    const ORDER = ["TODAY", "YESTERDAY", "PAST 7 DAYS"];
    const buckets = {};
    sessions.forEach((s) => {
        const d = new Date(s.updatedAt || s.createdAt || now);
        const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const key = day >= todayStart ? "TODAY" : day >= yestStart ? "YESTERDAY" : day >= weekStart ? "PAST 7 DAYS" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        if (!buckets[key]) buckets[key] = [];
        buckets[key].push(s);
    });
    const result = {};
    ORDER.forEach((k) => { if (buckets[k]) result[k] = buckets[k]; });
    Object.keys(buckets).filter(k => !ORDER.includes(k)).forEach(k => { result[k] = buckets[k]; });
    return result;
}

const msgTime = (raw) => {
    if (!raw) return "";
    return new Date(raw).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
};

/* ═══════════════════════════════════════════════════════
   CONTENT (bilingual)
═══════════════════════════════════════════════════════ */

const CONTENT = {
    en: {
        newChat: "New Cosmic Consultation",
        placeholder: "Ask anything about your Kundli, career transits, planetary dashas, or love synergy...",
        emptyHeading: "AstroAsk Cosmic Oracle",
        emptySub: "Consult the stars on your Janam Kundli, planetary transits, career horizons, love synergy, and authentic Vedic remedies.",
        suggestions: [
            { icon: <Briefcase size={13} className="text-[#7c5800]" />, q: "Mera career kaisa rahega?", sub: "10th House analysis & Rahu Mahadasha" },
            { icon: <Star size={13} className="text-amber-500" />, q: "Aaj ka Aries horoscope batao", sub: "Daily planetary influences & shubh muhurat" },
            { icon: <Zap size={13} className="text-amber-500" />, q: "Mera strongest planet kaunsa hai?", sub: "Atmakaraka & Shadbala strength check" },
            { icon: <Heart size={13} className="text-red-400" />, q: "Love life ke baare mein batao", sub: "7th house lord & Venus transit impact" },
        ],
        disclaimer: "AstroAsk calculates exact astronomical planetary degrees. For major life events, consult a verified Acharya.",
        pressEnter: "Press ↵ to send",
        natalPill: "Natal (D1) Active",
        aiHeader: "Vedic Analysis & Planetary Shastra",
    },
    hi: {
        newChat: "नई कॉस्मिक परामर्श",
        placeholder: "अपनी कुंडली, करियर ट्रांजिट, ग्रह दशा, या प्रेम जीवन के बारे में पूछें...",
        emptyHeading: "AstroAsk कॉस्मिक ऑरेकल",
        emptySub: "अपनी जन्म कुंडली, ग्रह गोचर, करियर, प्रेम जीवन और वैदिक उपायों के बारे में सितारों से परामर्श करें।",
        suggestions: [
            { icon: <Briefcase size={13} className="text-[#7c5800]" />, q: "मेरा करियर कैसा रहेगा?", sub: "10वें भाव का विश्लेषण और राहु महादशा" },
            { icon: <Star size={13} className="text-amber-500" />, q: "आज का मेष राशिफल बताओ", sub: "दैनिक ग्रह प्रभाव और शुभ मुहूर्त" },
            { icon: <Zap size={13} className="text-amber-500" />, q: "मेरा सबसे शक्तिशाली ग्रह कौन सा है?", sub: "आत्मकारक और षाड्बल शक्ति जांच" },
            { icon: <Heart size={13} className="text-red-400" />, q: "प्रेम जीवन के बारे में बताओ", sub: "सप्तम भाव और शुक्र गोचर प्रभाव" },
        ],
        disclaimer: "AstroAsk सटीक खगोलीय ग्रह डिग्री की गणना करता है। बड़े जीवन निर्णयों के लिए किसी प्रमाणित आचार्य से परामर्श करें।",
        pressEnter: "↵ दबाएं भेजने के लिए",
        natalPill: "जन्म (D1) सक्रिय",
        aiHeader: "वैदिक विश्लेषण और ग्रह शास्त्र",
    },
};

/* ═══════════════════════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════════════════════ */

const EmptyState = ({ onNew, c }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[360px] gap-5 px-4 py-10 text-center">
        <div className="w-[58px] h-[58px] rounded-[18px] bg-[#fff9ed] border border-[#ffb800]/30 shadow-sm flex items-center justify-center">
            <div className="w-9 h-9 rounded-full border-[2.5px] border-[#ffb800] flex items-center justify-center">
                <span className="text-[#ffb800] text-[22px] leading-none font-light select-none">+</span>
            </div>
        </div>
        <div className="space-y-1.5">
            <h2 className="text-[26px] sm:text-[30px] font-bold text-[#1a1a1a] font-['Playfair_Display',Georgia,serif] leading-tight">{c.emptyHeading}</h2>
            <p className="text-[13px] text-[#5f5e5e] max-w-sm mx-auto leading-relaxed">{c.emptySub}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
            {c.suggestions.map((s) => (
                <button key={s.q} onClick={() => onNew(s.q)}
                    className="flex items-start gap-3 text-left bg-white border border-[rgba(26,26,26,0.09)] hover:border-[#ffb800]/50 hover:shadow-md rounded-2xl p-3.5 transition-all duration-200 group cursor-pointer">
                    <span className="w-7 h-7 rounded-lg bg-[#fff9ed] border border-[#ffb800]/20 flex items-center justify-center shrink-0 group-hover:bg-[#fff3d0] transition-colors mt-0.5">{s.icon}</span>
                    <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold text-[#1a1a1a] leading-snug">{s.q}</p>
                        <p className="text-[11px] text-[#5f5e5e] mt-0.5 line-clamp-1">{s.sub}</p>
                    </div>
                </button>
            ))}
        </div>
    </div>
);

const UserBubble = ({ msg, initial }) => {
    const text = cleanMsgText(msg.content);
    const hasText = text && text !== "Image attached";

    return (
        <div className="flex items-end justify-end gap-2.5">
            <div className="flex flex-col items-end gap-1.5 max-w-[85%] sm:max-w-[70%]">
                {msg.imageUrl && (
                    <div className="overflow-hidden rounded-2xl border border-[rgba(26,26,26,0.12)] bg-white shadow-sm max-w-[280px] group">
                        <img
                            src={msg.imageUrl}
                            alt={msg.imageName || "Astrology Chart or Palm"}
                            className="w-full max-h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => window.open(msg.imageUrl, "_blank")}
                            loading="lazy"
                        />
                        <div className="px-3 py-1.5 bg-[#fafaf7] border-t border-[rgba(26,26,26,0.06)] flex items-center justify-between text-[10.5px] text-[#5f5e5e]">
                            <span className="truncate max-w-[190px] font-medium">{msg.imageName || "Astrology Image"}</span>
                            <span
                                onClick={() => window.open(msg.imageUrl, "_blank")}
                                className="text-[#7c5800] font-semibold ml-1 cursor-pointer hover:underline shrink-0"
                            >
                                View ↗
                            </span>
                        </div>
                    </div>
                )}
                {hasText && (
                    <div className="bg-[#1f1e1d] text-[#fbfaf8] text-[13.5px] leading-relaxed px-4 py-3 rounded-[20px] rounded-br-[4px] shadow-sm break-words whitespace-pre-wrap">
                        {text}
                    </div>
                )}
                {msg.createdAt && <span className="text-[10px] text-[#5f5e5e] font-medium pr-1">{msgTime(msg.createdAt)}</span>}
            </div>
            <div className="w-9 h-9 rounded-full bg-[#5b21b6] text-white text-[13px] font-bold flex items-center justify-center shrink-0 shadow-sm select-none mb-1">{initial}</div>
        </div>
    );
};

/* AI card — renders markdown content */
const AICard = ({ msg, aiHeader }) => (
    <div className="flex items-start gap-2.5 sm:gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ffb800] to-[#f59e0b] text-[#5c3d00] text-[15px] font-bold flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(255,184,0,0.3)] select-none mt-0.5">✦</div>
        <div className="flex-1 max-w-[92%] sm:max-w-[82%] bg-white rounded-[22px] rounded-tl-[6px] border border-[#ffb800]/25 shadow-[0_2px_14px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-[#ffb800]/15 bg-[#fffdf9]">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ffb800] animate-pulse" />
                    <span className="text-[12px] font-bold text-[#7c5800] tracking-wide">{aiHeader}</span>
                </div>
                {msg.createdAt && <span className="text-[10px] text-[#5f5e5e]/70 shrink-0 font-medium">{msgTime(msg.createdAt)}</span>}
            </div>
            <div className="px-5 py-4 text-[13.5px] text-[#1a1a1a] leading-relaxed">
                <MarkdownContent text={msg.content} />
            </div>
        </div>
    </div>
);

/* Streaming card — renders markdown as it arrives */
const StreamingCard = ({ text, aiHeader }) => (
    <div className="flex items-start gap-2.5 sm:gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ffb800] to-[#f59e0b] text-[#5c3d00] text-[15px] font-bold flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(255,184,0,0.3)] select-none mt-0.5">✦</div>
        <div className="flex-1 max-w-[92%] sm:max-w-[82%] bg-white rounded-[22px] rounded-tl-[6px] border border-[#ffb800]/25 shadow-[0_2px_14px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#ffb800]/15 bg-[#fffdf9]">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ffb800] animate-pulse" />
                    <span className="text-[12px] font-bold text-[#7c5800] tracking-wide">{aiHeader}</span>
                </div>
                <div className="flex gap-1 items-center">
                    {[0, 140, 280].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#ffb800] animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                </div>
            </div>
            <div className="px-5 py-4 text-[13.5px] text-[#1a1a1a] leading-relaxed">
                <MarkdownContent text={text} />
                <span className="inline-block w-[2.5px] h-[15px] bg-[#ffb800] ml-1 animate-pulse rounded-full align-middle" />
            </div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════ */

const Sidebar = ({ sessions, activeId, onSelect, onNew, onDelete, loading, mobileOpen, onCloseMobile, user, newChatLabel }) => {
    const [tab, setTab] = useState("ai");
    const grouped = groupSessions(sessions);
    const userName = user?.name || user?.email?.split("@")[0] || "User";

    return (
        <>
            {mobileOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-30 md:hidden" onClick={onCloseMobile} aria-hidden="true" />}
            <aside className={`fixed top-[57px] bottom-0 left-0 md:relative md:top-auto md:bottom-auto z-40 md:z-auto w-[265px] shrink-0 bg-[#fafaf7] border-r border-[rgba(26,26,26,0.1)] flex flex-col transform transition-transform duration-200 ease-in-out md:translate-x-0 ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}>

                {/* New chat */}
                <div className="px-3 pt-3.5 pb-3">
                    <button id="new-chat-btn" onClick={() => { onNew(); onCloseMobile?.(); }}
                        className="w-full flex items-center justify-center gap-2 bg-[#ffb800] hover:bg-amber-400 active:scale-[0.97] text-[#5c3d00] font-bold py-[11px] rounded-[14px] text-[12px] tracking-wide transition-all shadow-[0_2px_8px_rgba(255,184,0,0.3)] cursor-pointer">
                        <Plus size={15} strokeWidth={2.5} />
                        {newChatLabel}
                    </button>
                </div>

                {/* Tabs */}
                <div className="mx-3 mb-3 grid grid-cols-2 bg-[#eeece7] p-[3px] rounded-[12px]">
                    {[{ key: "ai", label: "Vedic AI" }, { key: "live", label: "Live Astrologer" }].map(({ key, label }) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`py-1.5 text-[11px] font-semibold rounded-[10px] transition-all cursor-pointer ${tab === key ? "bg-white shadow-sm text-[#7c5800]" : "text-[#5f5e5e] hover:text-[#7c5800]"}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Session list */}
                <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
                    {tab === "live" ? (
                        <div className="flex flex-col items-center gap-3 py-14 px-5 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-[#fff9ed] border border-[#ffb800]/30 flex items-center justify-center"><Users size={20} className="text-[#7c5800]" /></div>
                            <p className="text-[12px] text-[#5f5e5e] leading-relaxed">Live astrologer consultations coming soon.</p>
                            <span className="px-3 py-1 bg-[#fff9ed] border border-[#ffb800]/30 rounded-full text-[10px] text-[#7c5800] font-semibold">Coming Soon</span>
                        </div>
                    ) : loading ? (
                        <p className="text-center text-[#5f5e5e] text-[11px] py-8">Loading...</p>
                    ) : sessions.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
                            <MessageSquare size={26} className="text-[#5f5e5e]/25" />
                            <p className="text-[11px] text-[#5f5e5e]/70">No consultations yet.<br />Start your first one!</p>
                        </div>
                    ) : (
                        Object.entries(grouped).map(([label, group]) => (
                            <div key={label} className="mb-1">
                                <p className="px-2 pt-3 pb-1.5 text-[9px] uppercase tracking-[0.2em] font-bold text-[#5f5e5e]/50 select-none">{label}</p>
                                {group.map((s) => {
                                    const isActive = activeId === s._id;
                                    const rawTitle = cleanMsgText(s.title);
                                    const lastText = cleanMsgText(s.lastMessage || s.subtitle);
                                    // If title is 1-3 letters (like "k", "kya"), fallback gracefully
                                    const titleText = (!rawTitle || rawTitle.trim().length <= 3)
                                        ? (lastText && lastText.length > 3
                                            ? lastText.slice(0, 24) + (lastText.length > 24 ? "..." : "")
                                            : "Vedic Consultation")
                                        : rawTitle;
                                    return (
                                        <div key={s._id} onClick={() => { onSelect(s._id); onCloseMobile?.(); }}
                                            className={`group relative flex flex-col gap-0.5 px-2.5 py-2 rounded-[10px] cursor-pointer transition-all duration-150 mb-0.5 ${isActive ? "bg-[#fff9ed] border border-[#ffb800]/40" : "border border-transparent hover:bg-[#f0ede8]"}`}>
                                            <div className="flex items-center justify-between gap-1 min-w-0">
                                                <span className={`text-[12px] font-semibold truncate leading-snug ${isActive ? "text-[#7c5800]" : "text-[#1a1a1a]"}`}>{titleText}</span>
                                                <span className={`text-[10px] shrink-0 ${isActive ? "text-[#7c5800]/70" : "text-[#5f5e5e]"}`}>{sessionTimeLabel(s.updatedAt || s.createdAt)}</span>
                                            </div>
                                            {lastText && (
                                                <p className="text-[11px] text-[#5f5e5e]/70 truncate leading-tight pr-5">{lastText}</p>
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); onDelete(s._id); }}
                                                className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded-md text-[#5f5e5e]/40 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer" aria-label="Delete">
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Birth chart widget */}
                {user && (
                    <div className="mx-2.5 mb-3 mt-1 rounded-[14px] border border-[rgba(26,26,26,0.1)] bg-white shadow-sm p-3">
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#ffb800]" />
                                <span className="text-[11px] font-bold text-[#1a1a1a] truncate max-w-[120px]">{userName}&apos;s Birth Chart</span>
                            </div>
                            <Link to="/kundli" className="text-[10px] font-semibold text-[#7c5800] hover:underline shrink-0">View Chart</Link>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                            {[
                                { label: "SUN", val: user.sunSign || "Leo", bg: "bg-amber-50", text: "text-amber-700" },
                                { label: "MOON", val: user.moonSign || "Taurus", bg: "bg-blue-50", text: "text-blue-700" },
                                { label: "ASCENDANT", val: user.ascendant || "Scorpio", bg: "bg-purple-50", text: "text-purple-700" },
                            ].map((p) => (
                                <div key={p.label} className={`rounded-lg py-1.5 px-1 text-center ${p.bg}`}>
                                    <p className={`text-[8px] uppercase tracking-wide font-bold opacity-60 ${p.text}`}>{p.label}</p>
                                    <p className={`text-[10px] font-bold truncate ${p.text}`}>{p.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

/* ═══════════════════════════════════════════════════════
   CHAT PAGE
═══════════════════════════════════════════════════════ */

export default function ChatPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        sessions, activeSession, streamingText, isStreaming, loading,
        handleFetchSessions, handleSelectSession, handleSendMessage,
        handleNewChat, handleDeleteSession,
    } = useChat();

    const [input, setInput] = useState("");
    const [lang, setLang] = useState(() => localStorage.getItem("astro_lang") || "en");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const bottomRef = useRef(null);
    const taRef = useRef(null);
    const fileInputRef = useRef(null);
    // Keep lang in a ref so sendMsg closure always reads the latest value
    const langRef = useRef(lang);
    useEffect(() => { langRef.current = lang; }, [lang]);

    const c = CONTENT[lang];
    const userInitial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
    const messages = activeSession?.messages || [];

    useEffect(() => { handleFetchSessions(); }, []);

    useEffect(() => {
        if (id && (!activeSession || activeSession._id !== id)) handleSelectSession(id);
    }, [id]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamingText]);

    useEffect(() => {
        const ta = taRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = `${Math.min(ta.scrollHeight, 130)}px`;
    }, [input]);

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file (JPG, PNG, WebP, GIF)");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5MB");
            return;
        }

        setSelectedImage(file);
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        e.target.value = "";
    };

    const handleRemoveImage = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setSelectedImage(null);
        setImagePreview(null);
    };

    const selectChat = useCallback((sid) => { handleSelectSession(sid); navigate(`/chat/${sid}`); }, []);
    const startNewChat = useCallback(async () => { const s = await handleNewChat(); navigate(s?._id ? `/chat/${s._id}` : "/chat"); }, []);

    const sendMsg = useCallback(async (text) => {
        const msg = (text ?? input).trim();
        if ((!msg && !selectedImage) || isStreaming) return;

        const imgFile = selectedImage;
        const imgPreview = imagePreview;

        setInput("");
        setSelectedImage(null);
        setImagePreview(null);

        let sid = activeSession?._id;
        if (!sid) {
            const s = await handleNewChat();
            if (!s?._id) return;
            sid = s._id;
            navigate(`/chat/${sid}`);
        }
        // Always read lang from ref to avoid stale closure
        handleSendMessage(msg, sid, langRef.current, imgFile, imgPreview);
    }, [input, selectedImage, imagePreview, isStreaming, activeSession]);

    const onKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } };

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden font-['Inter',sans-serif] text-[#1a1a1a] selection:bg-[#ffb800] selection:text-black">
            <Navbar lang={lang} onLangChange={setLang} onOpenChatSidebar={() => setMobileOpen(true)} />

            <div className="flex flex-1 overflow-hidden" style={{ paddingTop: "57px" }}>
                <Sidebar
                    sessions={sessions} activeId={activeSession?._id}
                    onSelect={selectChat} onNew={startNewChat}
                    onDelete={handleDeleteSession} loading={loading}
                    mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)}
                    user={user} newChatLabel={c.newChat}
                />

                <main className="flex-1 flex flex-col overflow-hidden bg-[#faf8f5]">
                    {/* ── Messages ── */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-10 lg:px-14 py-6 space-y-5 bg-[#faf8f5]">
                        {messages.length === 0 && !isStreaming ? (
                            <EmptyState onNew={sendMsg} c={c} />
                        ) : (
                            <>
                                {messages.map((msg, i) =>
                                    msg.role === "user"
                                        ? <UserBubble key={i} msg={msg} initial={userInitial} />
                                        : <AICard key={i} msg={msg} aiHeader={c.aiHeader} />
                                )}
                                {isStreaming && streamingText && <StreamingCard text={streamingText} aiHeader={c.aiHeader} />}
                            </>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* ── Input ── */}
                    <div className="shrink-0 px-3 sm:px-6 pt-2.5 pb-3.5 border-t border-[rgba(26,26,26,0.08)] bg-white/95 backdrop-blur-sm">
                        <div className="max-w-3xl mx-auto">
                            <div className="border border-[rgba(26,26,26,0.14)] rounded-[20px] bg-white shadow-[0_2px_14px_rgba(0,0,0,0.06)] overflow-hidden focus-within:border-[#ffb800] focus-within:shadow-[0_0_0_3px_rgba(255,184,0,0.15)] transition-all duration-200">
                                {/* Image preview thumbnail */}
                                {imagePreview && (
                                    <div className="px-3.5 pt-3 pb-1 flex items-center gap-3 bg-[#fffdf9] border-b border-[rgba(26,26,26,0.06)]">
                                        <div className="relative group shrink-0">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-12 h-12 object-cover rounded-xl border border-[#ffb800]/40 shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow cursor-pointer transition-colors"
                                                title="Remove image"
                                            >
                                                <X size={10} strokeWidth={3} />
                                            </button>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11.5px] font-semibold text-[#1a1a1a] truncate">
                                                {selectedImage?.name || "Uploaded Chart/Palm Image"}
                                            </p>
                                            <p className="text-[10px] text-[#7c5800] font-medium">
                                                {((selectedImage?.size || 0) / 1024).toFixed(0)} KB • Ready for Vedic analysis
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="text-[11px] text-[#5f5e5e] hover:text-red-500 font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}

                                <textarea id="chat-input" ref={taRef} rows={1} value={input}
                                    onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown}
                                    disabled={isStreaming} placeholder={selectedImage ? (lang === "hi" ? "इस छवि के बारे में पूछें (वैकल्पिक)..." : "Ask about this chart or palm image (optional)...") : c.placeholder}
                                    className="w-full bg-transparent text-[13px] text-[#1a1a1a] placeholder-[#5f5e5e]/50 resize-none focus:outline-none disabled:opacity-50 px-4 pt-3.5 pb-2 leading-relaxed max-h-32" />
                                <div className="flex items-center justify-between px-3 pb-2.5 gap-2">
                                    <div className="flex items-center gap-1">
                                        {/* Hidden file input for ImageKit upload */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            className="hidden"
                                            onChange={handleImageSelect}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isStreaming}
                                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${selectedImage
                                                    ? "text-[#7c5800] bg-[#fff9ed] border border-[#ffb800]/40 shadow-xs"
                                                    : "text-[#5f5e5e]/50 hover:text-[#7c5800] hover:bg-[#f4ece1]"
                                                }`}
                                            aria-label="Attach chart or palm image"
                                            title={selectedImage ? "Change image" : "Attach birth chart or palm image"}
                                        >
                                            <Paperclip size={14} />
                                        </button>
                                        <button className="p-1.5 rounded-lg text-[#5f5e5e]/50 hover:text-[#7c5800] hover:bg-[#f4ece1] transition-colors" aria-label="Voice"><Mic size={14} /></button>
                                        <span className="hidden sm:inline-flex items-center gap-1.5 ml-1 px-2.5 py-1 bg-[#fff9ed] border border-[#ffb800]/30 rounded-full text-[10px] text-[#7c5800] font-semibold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb800]" />{c.natalPill}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="hidden sm:block text-[10px] text-[#5f5e5e]/50 select-none">{c.pressEnter}</span>
                                        <button id="send-message-btn" onClick={() => sendMsg()} disabled={(!input.trim() && !selectedImage) || isStreaming}
                                            className="w-9 h-9 bg-[#ffb800] hover:bg-amber-400 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-[#6b4c00] rounded-full flex items-center justify-center transition-all shadow-[0_2px_8px_rgba(255,184,0,0.4)] cursor-pointer shrink-0" aria-label="Send">
                                            <Send size={15} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[9px] text-center text-[#5f5e5e]/45 mt-1.5 select-none">{c.disclaimer}</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}