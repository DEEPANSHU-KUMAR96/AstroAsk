import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Sparkles,
    Calendar,
    Clock,
    MapPin,
    User as UserIcon,
    Trash2,
    Compass,
    Languages,
    ChevronLeft,
    CheckCircle2,
    BookOpen,
    Star,
    Layers
} from "lucide-react";
import Navbar from "../../../app/components/Navbar";
import useKundli from "../hooks/useKundli";
import useAuth from "../../auth/hooks/useAuth";

// North Indian Vedic Chart representation
const VedicChart = ({ houses = [], planets = [] }) => {
    // Map planets by house
    const planetsByHouse = {};
    planets.forEach((p) => {
        const h = p.house;
        if (!planetsByHouse[h]) planetsByHouse[h] = [];
        planetsByHouse[h].push(p.name + (p.isRetro ? "(R)" : ""));
    });

    const housePositions = [
        { house: 1, x: 200, y: 105, labelX: 200, labelY: 60 },
        { house: 2, x: 105, y: 55, labelX: 105, labelY: 30 },
        { house: 3, x: 55, y: 105, labelX: 30, labelY: 105 },
        { house: 4, x: 105, y: 200, labelX: 60, labelY: 200 },
        { house: 5, x: 55, y: 295, labelX: 30, labelY: 295 },
        { house: 6, x: 105, y: 345, labelX: 105, labelY: 370 },
        { house: 7, x: 200, y: 295, labelX: 200, labelY: 340 },
        { house: 8, x: 295, y: 345, labelX: 295, labelY: 370 },
        { house: 9, x: 345, y: 295, labelX: 370, labelY: 295 },
        { house: 10, x: 295, y: 200, labelX: 340, labelY: 200 },
        { house: 11, x: 345, y: 105, labelX: 370, labelY: 105 },
        { house: 12, x: 295, y: 55, labelX: 295, labelY: 30 },
    ];

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-[420px] aspect-square">
                <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-md">
                    {/* Outer background */}
                    <rect x="0" y="0" width="400" height="400" fill="#fdfcf9" stroke="#7c5800" strokeWidth="2.5" />

                    {/* Diagonals */}
                    <line x1="0" y1="0" x2="400" y2="400" stroke="#7c5800" strokeWidth="1.5" />
                    <line x1="400" y1="0" x2="0" y2="400" stroke="#7c5800" strokeWidth="1.5" />

                    {/* Central Diamond */}
                    <polygon points="200,0 400,200 200,400 0,200" fill="none" stroke="#7c5800" strokeWidth="1.5" />

                    {/* Render House sign numbers and planets */}
                    {housePositions.map(({ house, x, y, labelX, labelY }) => {
                        const houseData = houses.find((h) => h.house === house);
                        const plList = planetsByHouse[house] || [];

                        return (
                            <g key={house}>
                                {/* House Sign Name */}
                                <text
                                    x={labelX}
                                    y={labelY}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="fill-[#7c5800] text-[10px] font-bold tracking-tight"
                                >
                                    {houseData?.sign ? houseData.sign.slice(0, 3) : `H${house}`}
                                </text>

                                {/* House number indicator (subtle) */}
                                <text
                                    x={labelX}
                                    y={labelY + 12}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="fill-[rgba(124,88,0,0.4)] text-[8px]"
                                >
                                    ({house})
                                </text>

                                {/* Occupying Planets */}
                                {plList.map((pl, idx) => (
                                    <text
                                        key={idx}
                                        x={x}
                                        y={y + (idx - (plList.length - 1) / 2) * 13}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="fill-[#1a1a1a] text-[11px] font-semibold"
                                    >
                                        {pl}
                                    </text>
                                ))}
                            </g>
                        );
                    })}
                </svg>
            </div>
            <p className="text-xs text-[#5f5e5e] mt-3 tracking-wide">
                Classic North Indian Lagna Kundli • House 1 at Top Center Diamond
            </p>
        </div>
    );
};

const PlanetRow = ({ planet }) => (
    <tr className="border-b border-[#f4ece1] hover:bg-[#fff9ed]/60 transition-colors">
        <td className="py-2.5 px-4 font-semibold text-[#7c5800] flex items-center gap-1.5">
            <span>✦</span> {planet.name}
        </td>
        <td className="py-2.5 px-4 text-[#1a1a1a] font-medium">{planet.sign}</td>
        <td className="py-2.5 px-4 text-[#5f5e5e]">House {planet.house}</td>
        <td className="py-2.5 px-4 text-[#5f5e5e]">{planet.nakshatra || "—"}</td>
        <td className="py-2.5 px-4 text-xs font-mono text-[#5f5e5e]">
            {planet.degree ? `${planet.degree.toFixed(1)}°` : "—"}
        </td>
        <td className="py-2.5 px-4">
            {planet.isRetro && (
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                    Retrograde
                </span>
            )}
        </td>
    </tr>
);

const ReadingSection = ({ reading, loading, onGenerate, lang, setLang }) => {
    const hasReading = Boolean(reading?.summary);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-10 h-10 border-3 border-[#ffb800] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-['Playfair_Display',Georgia,serif] text-lg font-semibold text-[#7c5800]">
                    Consulting the Celestial Grok & Vedic AI...
                </p>
                <p className="text-xs text-[#5f5e5e] mt-1">Analyzing planetary alignments and house transits</p>
            </div>
        );
    }

    if (!hasReading) {
        return (
            <div className="text-center py-14 px-6 bg-[#fdfcf9] rounded-2xl border border-[rgba(26,26,26,0.08)]">
                <Sparkles className="w-10 h-10 text-[#ffb800] mx-auto mb-3 animate-pulse" />
                <h3 className="font-['Playfair_Display',Georgia,serif] text-xl font-bold text-[#1a1a1a] mb-2">
                    Reveal Your Personalized AI Horoscope & Kundli Reading
                </h3>
                <p className="text-sm text-[#5f5e5e] max-w-md mx-auto mb-6">
                    Our Vedic AI analyzes your planetary placements, lagna lord, and current dasha to generate in-depth insights into your destiny, career, love, and health.
                </p>

                <div className="flex items-center justify-center gap-3 mb-6">
                    <span className="text-xs font-semibold text-[#5f5e5e] uppercase tracking-wider">Language:</span>
                    <button
                        type="button"
                        onClick={() => setLang("en")}
                        className={`px-3 py-1 text-xs rounded-full font-medium transition cursor-pointer ${
                            lang === "en" ? "bg-[#7c5800] text-white" : "bg-[#f4ece1] text-[#5f5e5e]"
                        }`}
                    >
                        English
                    </button>
                    <button
                        type="button"
                        onClick={() => setLang("hi")}
                        className={`px-3 py-1 text-xs rounded-full font-medium transition cursor-pointer ${
                            lang === "hi" ? "bg-[#7c5800] text-white" : "bg-[#f4ece1] text-[#5f5e5e]"
                        }`}
                    >
                        हिंदी (Hindi)
                    </button>
                </div>

                <button
                    onClick={() => onGenerate(lang)}
                    className="bg-[#ffb800] hover:bg-[#ffba20] text-[#6b4c00] font-bold px-8 py-3 rounded-full transition shadow-md active:scale-95 cursor-pointer"
                >
                    Generate AI Vedic Reading ✨
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#fffbf2] p-4 rounded-xl border border-[#ffb800]/30">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#ffb800]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7c5800]">
                        Vedic AI Life Reading
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const newLang = lang === "en" ? "hi" : "en";
                            setLang(newLang);
                            onGenerate(newLang);
                        }}
                        className="text-xs font-semibold text-[#7c5800] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                        <Languages size={14} />
                        Switch to {lang === "en" ? "हिंदी" : "English"}
                    </button>
                </div>
            </div>

            {/* Core Summary */}
            <div className="bg-white rounded-2xl p-6 border border-[rgba(26,26,26,0.08)] shadow-sm">
                <h4 className="font-['Playfair_Display',Georgia,serif] text-lg font-bold text-[#1a1a1a] mb-2">
                    Cosmic Essence & Overview
                </h4>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">{reading.summary}</p>
            </div>

            {/* Strengths & Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#f2f9f2] border border-green-200 rounded-2xl p-5">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-600" /> Celestial Strengths
                    </h4>
                    <ul className="space-y-2">
                        {reading.strengths?.map((s, i) => (
                            <li key={i} className="text-xs md:text-sm text-green-900 flex gap-2">
                                <span className="text-green-500 font-bold">✦</span>
                                <span>{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-[#fff4f2] border border-red-200 rounded-2xl p-5">
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                        <Star size={16} className="text-red-600" /> Karmic Growth & Challenges
                    </h4>
                    <ul className="space-y-2">
                        {reading.challenges?.map((c, i) => (
                            <li key={i} className="text-xs md:text-sm text-red-900 flex gap-2">
                                <span className="text-red-500 font-bold">✦</span>
                                <span>{c}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Career, Love, Health */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "Career & Dharma", value: reading.career, icon: "💼", color: "bg-[#fdfcf9]" },
                    { label: "Love & Bonds", value: reading.love, icon: "❤️", color: "bg-[#fffbfb]" },
                    { label: "Health & Vitality", value: reading.health, icon: "🌿", color: "bg-[#fbfdfa]" },
                ].map(({ label, value, icon, color }) => (
                    <div key={label} className={`${color} border border-[rgba(26,26,26,0.08)] rounded-2xl p-5 shadow-sm`}>
                        <h4 className="font-semibold text-[#7c5800] mb-2 flex items-center gap-2 text-sm">
                            <span>{icon}</span> {label}
                        </h4>
                        <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{value || "—"}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const GenerateForm = ({ onSubmit, loading, user }) => {
    const [formData, setFormData] = useState({
        name: user?.name || "",
        birthDate: user?.birthDate ? user.birthDate.split("T")[0] : "",
        birthTime: user?.birthTime || "",
        birthPlace: user?.birthPlace || "",
    });
    const [errors, setErrors] = useState({});

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const fillFromProfile = () => {
        if (!user) return;
        setFormData({
            name: user.name || "",
            birthDate: user.birthDate ? user.birthDate.split("T")[0] : "",
            birthTime: user.birthTime || "",
            birthPlace: user.birthPlace || "",
        });
        setErrors({});
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = "Full name is required";
        if (!formData.birthDate) errs.birthDate = "Birth date is required";
        if (!formData.birthTime) {
            errs.birthTime = "Birth time is required (HH:MM)";
        } else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.birthTime)) {
            errs.birthTime = "Valid time required (HH:MM in 24-hour format)";
        }
        if (!formData.birthPlace.trim()) errs.birthPlace = "Birth place is required";
        return errs;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {user?.birthPlace && (
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={fillFromProfile}
                        className="text-xs font-semibold text-[#7c5800] hover:text-[#ffb800] flex items-center gap-1.5 transition cursor-pointer"
                    >
                        <UserIcon size={13} />
                        Autofill from my profile
                    </button>
                </div>
            )}

            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1.5">
                    Full Name
                </label>
                <div className="relative">
                    <input
                        value={formData.name}
                        onChange={handleChange("name")}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-[#fdfcf9] border border-[rgba(26,26,26,0.15)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffb800] transition"
                    />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1.5">
                        Birth Date
                    </label>
                    <input
                        type="date"
                        value={formData.birthDate}
                        onChange={handleChange("birthDate")}
                        className="w-full bg-[#fdfcf9] border border-[rgba(26,26,26,0.15)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffb800] transition"
                    />
                    {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1.5">
                        Birth Time (24h)
                    </label>
                    <input
                        type="time"
                        value={formData.birthTime}
                        onChange={handleChange("birthTime")}
                        className="w-full bg-[#fdfcf9] border border-[rgba(26,26,26,0.15)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffb800] transition"
                    />
                    {errors.birthTime && <p className="text-red-500 text-xs mt-1">{errors.birthTime}</p>}
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1.5">
                    Birth Place (City, State, Country)
                </label>
                <div className="relative">
                    <input
                        value={formData.birthPlace}
                        onChange={handleChange("birthPlace")}
                        placeholder="e.g. New Delhi, India"
                        className="w-full bg-[#fdfcf9] border border-[rgba(26,26,26,0.15)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffb800] transition"
                    />
                </div>
                {errors.birthPlace && <p className="text-red-500 text-xs mt-1">{errors.birthPlace}</p>}
                <p className="text-[11px] text-[#5f5e5e] mt-1">
                    Used to calculate exact geographical coordinates and Vedic ascendant.
                </p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ffb800] hover:bg-[#ffba20] disabled:opacity-50 text-[#6b4c00] font-bold py-3.5 rounded-full transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-[#6b4c00] border-t-transparent rounded-full animate-spin" />
                        Calculating Planetary Positions...
                    </>
                ) : (
                    <>
                        <Sparkles size={16} /> Generate Kundli Chart
                    </>
                )}
            </button>
        </form>
    );
};

const KundliDetail = ({ kundli, reading, readingLoading, onGetReading, onDelete }) => {
    const [tab, setTab] = useState("chart");
    const [readingLang, setReadingLang] = useState("en");

    const tabs = [
        { key: "chart", label: "Lagna Chart", icon: "🏛️" },
        { key: "planets", label: "Planets", icon: "🪐" },
        { key: "houses", label: "Houses", icon: "🏠" },
        { key: "dasha", label: "Dasha Timeline", icon: "⏳" },
        { key: "reading", label: "AI Reading", icon: "✨" },
    ];

    return (
        <div className="space-y-6">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-[#fff9ed] to-[#fcf6ea] border border-[#ffb800]/30 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="font-['Playfair_Display',Georgia,serif] text-2xl md:text-3xl font-bold text-[#1a1a1a]">
                                {kundli.name}
                            </h2>
                            <span className="text-xs bg-[#7c5800] text-white px-2.5 py-0.5 rounded-full font-medium">
                                Vedic Kundli
                            </span>
                        </div>
                        <p className="text-[#5f5e5e] text-sm mt-1.5 flex items-center gap-1.5">
                            <MapPin size={14} className="text-[#7c5800]" /> {kundli.birthPlace}
                        </p>
                        <p className="text-[#5f5e5e] text-sm flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1">
                                <Calendar size={14} className="text-[#7c5800]" />
                                {new Date(kundli.birthDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} className="text-[#7c5800]" /> {kundli.birthTime}
                            </span>
                        </p>
                    </div>

                    <button
                        onClick={() => onDelete(kundli._id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 self-start p-2 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        title="Delete Kundli"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                </div>

                {/* Core signs */}
                <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-[rgba(124,88,0,0.15)]">
                    <div>
                        <p className="text-[11px] uppercase tracking-wider text-[#5f5e5e] font-semibold">Sun Sign</p>
                        <p className="font-bold text-[#7c5800] text-sm sm:text-base">{kundli.sunSign || "—"}</p>
                    </div>
                    <div>
                        <p className="text-[11px] uppercase tracking-wider text-[#5f5e5e] font-semibold">Moon Sign</p>
                        <p className="font-bold text-[#7c5800] text-sm sm:text-base">{kundli.moonSign || "—"}</p>
                    </div>
                    <div>
                        <p className="text-[11px] uppercase tracking-wider text-[#5f5e5e] font-semibold">Ascendant (Lagna)</p>
                        <p className="font-bold text-[#7c5800] text-sm sm:text-base">
                            {kundli.ascendant?.sign || "—"}
                        </p>
                    </div>
                </div>

                {kundli.currentDasha && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-[#ffb800]/20 border border-[#ffb800]/40 px-3.5 py-1 rounded-full">
                        <span className="text-xs text-[#7c5800] font-medium">Active Mahadasha:</span>
                        <span className="text-xs font-bold text-[#6b4c00]">
                            {kundli.currentDasha.planet} Dasha (until {new Date(kundli.currentDasha.endDate).getFullYear()})
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 border-b border-[rgba(26,26,26,0.08)]">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer rounded-t-xl ${
                            tab === t.key
                                ? "bg-white text-[#7c5800] border-t-2 border-[#7c5800] shadow-sm"
                                : "text-[#5f5e5e] hover:text-[#7c5800]"
                        }`}
                    >
                        <span>{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Panes */}
            <div className="bg-white rounded-2xl p-6 border border-[rgba(26,26,26,0.08)] shadow-sm">
                {tab === "chart" && (
                    <VedicChart houses={kundli.houses} planets={kundli.planets} />
                )}

                {tab === "planets" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#fcfaf7] border-b border-[#f4ece1] text-xs font-bold uppercase tracking-wider text-[#7c5800]">
                                <tr>
                                    <th className="py-3 px-4">Planet</th>
                                    <th className="py-3 px-4">Zodiac Sign</th>
                                    <th className="py-3 px-4">House</th>
                                    <th className="py-3 px-4">Nakshatra</th>
                                    <th className="py-3 px-4">Degree</th>
                                    <th className="py-3 px-4">Motion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kundli.planets?.map((p) => (
                                    <PlanetRow key={p.name} planet={p} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === "houses" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {kundli.houses?.map((h) => (
                            <div
                                key={h.house}
                                className="bg-[#fcfaf7] border border-[#f4ece1] rounded-xl p-3.5 hover:border-[#ffb800]/60 transition"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c5800] block mb-1">
                                    House {h.house}
                                </span>
                                <p className="font-bold text-[#1a1a1a] text-sm">{h.sign}</p>
                                <p className="text-[11px] text-[#5f5e5e] mt-0.5">
                                    {h.degree ? `${h.degree.toFixed(1)}°` : ""}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {tab === "dasha" && (
                    <div className="space-y-2.5">
                        <p className="text-xs text-[#5f5e5e] mb-3">
                            Vimshottari Dasha sequence reveals planetary rulership periods over your lifetime.
                        </p>
                        {kundli.dashaSequence?.map((d, i) => {
                            const isCurrent =
                                kundli.currentDasha?.planet === d.planet &&
                                new Date(d.startDate).getTime() === new Date(kundli.currentDasha?.startDate).getTime();

                            return (
                                <div
                                    key={i}
                                    className={`flex justify-between items-center p-3.5 rounded-xl transition ${
                                        isCurrent
                                            ? "bg-[#fff9ed] border-2 border-[#ffb800] shadow-sm"
                                            : "bg-[#fcfaf7] border border-[#f4ece1]"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {isCurrent && <span className="w-2.5 h-2.5 bg-[#ffb800] rounded-full animate-ping" />}
                                        <span className="font-bold text-[#1a1a1a] text-sm">{d.planet} Mahadasha</span>
                                        <span className="text-xs text-[#5f5e5e] bg-white px-2 py-0.5 rounded-full border border-[rgba(26,26,26,0.08)]">
                                            {d.years} years
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-[#7c5800]">
                                        {new Date(d.startDate).getFullYear()} – {new Date(d.endDate).getFullYear()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {tab === "reading" && (
                    <ReadingSection
                        reading={reading || kundli.aiReading}
                        loading={readingLoading}
                        lang={readingLang}
                        setLang={setReadingLang}
                        onGenerate={(selectedLang) => onGetReading(kundli._id, selectedLang)}
                    />
                )}
            </div>
        </div>
    );
};

const KundliPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const {
        kundlis,
        selected,
        reading,
        loading,
        readingLoading,
        handleGenerate,
        handleFetchAll,
        handleFetchOne,
        handleDelete,
        handleGetReading,
    } = useKundli();

    const [view, setView] = useState(id ? "detail" : "create");

    useEffect(() => {
        if (isAuthenticated) {
            handleFetchAll();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (id) {
            handleFetchOne(id);
            setView("detail");
        }
    }, [id]);

    const onFormSubmit = async (data) => {
        const created = await handleGenerate(data);
        if (created?._id) {
            setView("detail");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#fbf9f8] text-[#1b1c1c] font-['Inter',sans-serif]">
            <Navbar />

            <main className="grow w-full max-w-5xl mx-auto px-6 md:px-12 pt-28 pb-20">
                {/* Unauthenticated notice */}
                {!isAuthenticated && (
                    <div className="mb-8 p-6 bg-[#fff9ed] border border-[#ffb800]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                        <div>
                            <h3 className="font-['Playfair_Display',Georgia,serif] text-lg font-bold text-[#7c5800]">
                                Sign in to save & view Kundlis
                            </h3>
                            <p className="text-xs text-[#5f5e5e] mt-1">
                                Kundli calculation and Vedic AI readings require an authenticated account.
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

                {/* Page Title & View Switcher */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="font-['Playfair_Display',Georgia,serif] text-3xl md:text-4xl font-bold text-[#1a1a1a] tracking-tight">
                            Vedic Kundli
                        </h1>
                        <p className="text-sm text-[#5f5e5e] mt-1">
                            Precise natal birth chart, planetary houses, vimshottari dasha & AI cosmic insights
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {view === "detail" ? (
                            <button
                                onClick={() => {
                                    setView("list");
                                    navigate("/kundli");
                                }}
                                className="text-xs font-semibold text-[#7c5800] hover:text-[#ffb800] flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[rgba(26,26,26,0.1)] transition cursor-pointer shadow-sm"
                            >
                                <ChevronLeft size={14} /> Back to Saved Kundlis
                            </button>
                        ) : (
                            <div className="flex bg-[#f4ece1]/70 p-1 rounded-full border border-[rgba(124,88,0,0.15)] text-xs font-semibold">
                                <button
                                    onClick={() => setView("create")}
                                    className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
                                        view === "create"
                                            ? "bg-[#7c5800] text-white shadow-sm"
                                            : "text-[#5f5e5e] hover:text-[#7c5800]"
                                    }`}
                                >
                                    + New Kundli
                                </button>
                                <button
                                    onClick={() => setView("list")}
                                    className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
                                        view === "list"
                                            ? "bg-[#7c5800] text-white shadow-sm"
                                            : "text-[#5f5e5e] hover:text-[#7c5800]"
                                    }`}
                                >
                                    Saved ({kundlis?.length || 0})
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Views */}
                {view === "create" && (
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-[rgba(26,26,26,0.08)] shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-[#ffb800]" />
                            <h2 className="font-['Playfair_Display',Georgia,serif] text-xl font-bold text-[#1a1a1a]">
                                Calculate Birth Chart (Janam Kundli)
                            </h2>
                        </div>
                        <GenerateForm onSubmit={onFormSubmit} loading={loading} user={user} />
                    </div>
                )}

                {view === "detail" && selected && (
                    <KundliDetail
                        kundli={selected}
                        reading={reading}
                        readingLoading={readingLoading}
                        onGetReading={handleGetReading}
                        onDelete={handleDelete}
                    />
                )}

                {view === "list" && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-['Playfair_Display',Georgia,serif] text-xl font-bold text-[#1a1a1a]">
                                Your Saved Birth Charts
                            </h2>
                            <button
                                onClick={() => setView("create")}
                                className="text-xs font-semibold text-[#7c5800] hover:text-[#ffb800] transition cursor-pointer"
                            >
                                + Generate another chart
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-16">
                                <div className="w-8 h-8 border-3 border-[#ffb800] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : kundlis.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-[rgba(26,26,26,0.08)] p-6">
                                <Compass className="w-12 h-12 text-[#ffb800]/60 mx-auto mb-3" />
                                <h3 className="font-['Playfair_Display',Georgia,serif] text-lg font-bold text-[#1a1a1a]">
                                    No Kundlis Generated Yet
                                </h3>
                                <p className="text-sm text-[#5f5e5e] max-w-sm mx-auto mt-1 mb-5">
                                    Generate your personal Vedic chart to explore planetary positions, houses, and AI readings.
                                </p>
                                <button
                                    onClick={() => setView("create")}
                                    className="bg-[#ffb800] text-[#6b4c00] font-bold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider hover:bg-[#ffba20] transition shadow-sm cursor-pointer"
                                >
                                    Create Your Kundli
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {kundlis.map((k) => (
                                    <div
                                        key={k._id}
                                        onClick={() => {
                                            handleFetchOne(k._id);
                                            navigate(`/kundli/${k._id}`);
                                            setView("detail");
                                        }}
                                        className="bg-white rounded-2xl border border-[rgba(26,26,26,0.08)] p-5 hover:border-[#ffb800] hover:shadow-md transition cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-['Playfair_Display',Georgia,serif] text-lg font-bold text-[#1a1a1a] group-hover:text-[#7c5800] transition">
                                                    {k.name}
                                                </h3>
                                                <p className="text-xs text-[#5f5e5e] mt-1 flex items-center gap-1">
                                                    <MapPin size={12} className="text-[#7c5800]" /> {k.birthPlace}
                                                </p>
                                                <p className="text-xs text-[#5f5e5e] mt-0.5 flex items-center gap-1">
                                                    <Calendar size={12} className="text-[#7c5800]" />
                                                    {new Date(k.birthDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-[#7c5800] bg-[#fff9ed] px-2.5 py-1 rounded-full border border-[#ffb800]/30 block mb-1">
                                                    Sun: {k.sunSign}
                                                </span>
                                                <span className="text-[11px] text-[#5f5e5e]">
                                                    Moon: {k.moonSign}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default KundliPage;