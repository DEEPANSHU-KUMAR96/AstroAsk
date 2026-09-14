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

// ─── Vedic Astrology Constants & Metadata ──────────────────────────────────────
const ZODIAC_SIGNS = {
    Aries: { num: 1, short: "Ari", sanskrit: "Mesha", lord: "Mars" },
    Taurus: { num: 2, short: "Tau", sanskrit: "Vrishabha", lord: "Venus" },
    Gemini: { num: 3, short: "Gem", sanskrit: "Mithuna", lord: "Mercury" },
    Cancer: { num: 4, short: "Can", sanskrit: "Karka", lord: "Moon" },
    Leo: { num: 5, short: "Leo", sanskrit: "Simha", lord: "Sun" },
    Virgo: { num: 6, short: "Vir", sanskrit: "Kanya", lord: "Mercury" },
    Libra: { num: 7, short: "Lib", sanskrit: "Tula", lord: "Venus" },
    Scorpio: { num: 8, short: "Sco", sanskrit: "Vrischika", lord: "Mars" },
    Sagittarius: { num: 9, short: "Sag", sanskrit: "Dhanu", lord: "Jupiter" },
    Capricorn: { num: 10, short: "Cap", sanskrit: "Makara", lord: "Saturn" },
    Aquarius: { num: 11, short: "Aqu", sanskrit: "Kumbha", lord: "Saturn" },
    Pisces: { num: 12, short: "Pis", sanskrit: "Meena", lord: "Jupiter" },
};

const getSignInfo = (signName) => {
    if (!signName) return { short: "", num: "", sanskrit: "", lord: "" };
    const normalized = signName.trim().toLowerCase();
    const matchKey = Object.keys(ZODIAC_SIGNS).find(
        (k) => k.toLowerCase() === normalized || normalized.startsWith(k.toLowerCase().slice(0, 3))
    );
    return matchKey ? ZODIAC_SIGNS[matchKey] : { short: signName.slice(0, 3), num: "", sanskrit: "", lord: "" };
};

const HOUSE_INFO = {
    1: { name: "1st House (Lagna)", sanskrit: "Tanu Bhava", meaning: "Self, Physical Constitution, Vitality, Personality & Soul Purpose" },
    2: { name: "2nd House", sanskrit: "Dhana Bhava", meaning: "Wealth, Accumulated Assets, Family Values, Speech & Food" },
    3: { name: "3rd House", sanskrit: "Sahaja Bhava", meaning: "Courage, Willpower, Younger Siblings, Communication & Manual Skills" },
    4: { name: "4th House", sanskrit: "Sukha Bhava", meaning: "Mother, Inner Peace, Home Sanctuary, Vehicles & Ancestral Roots" },
    5: { name: "5th House", sanskrit: "Putra Bhava", meaning: "Higher Intellect, Past-Life Karma (Purva Punya), Children & Creative Expression" },
    6: { name: "6th House", sanskrit: "Shatru Bhava", meaning: "Overcoming Adversity, Daily Service, Healing, Debts & Competition" },
    7: { name: "7th House", sanskrit: "Kalatra Bhava", meaning: "Life Partner, Marriage, Business Collaborations & Public Relations" },
    8: { name: "8th House", sanskrit: "Randhra Bhava", meaning: "Longevity, Mysticism, Kundalini, Sudden Transformations & Inheritance" },
    9: { name: "9th House", sanskrit: "Bhagya Bhava", meaning: "Divine Fortune, Dharma, Higher Philosophy, Guru & Spiritual Pilgrimages" },
    10: { name: "10th House", sanskrit: "Karma Bhava", meaning: "Career, Leadership, Social Prestige, Legacy & Public Actions" },
    11: { name: "11th House", sanskrit: "Labha Bhava", meaning: "Gains, Fulfillment of Desires, Wealth Inflow, Social Circles & Elders" },
    12: { name: "12th House", sanskrit: "Vyaya Bhava", meaning: "Spiritual Liberation (Moksha), Meditation, Foreign Lands & Inner Solitude" },
};

const PLANET_NAMES = {
    short: {
        Sun: "Su",
        Moon: "Mo",
        Mars: "Ma",
        Mercury: "Me",
        Jupiter: "Ju",
        Venus: "Ve",
        Saturn: "Sa",
        Rahu: "Ra",
        Ketu: "Ke",
        Uranus: "Ur",
        Neptune: "Ne",
        Pluto: "Pl",
        Ascendant: "Asc",
    },
    standard: {
        Sun: "Sun",
        Moon: "Moon",
        Mars: "Mars",
        Mercury: "Merc",
        Jupiter: "Jup",
        Venus: "Ven",
        Saturn: "Sat",
        Rahu: "Rahu",
        Ketu: "Ketu",
        Uranus: "Uran",
        Neptune: "Nept",
        Pluto: "Plut",
        Ascendant: "Asc",
    },
    full: {
        Sun: "Sun",
        Moon: "Moon",
        Mars: "Mars",
        Mercury: "Mercury",
        Jupiter: "Jupiter",
        Venus: "Venus",
        Saturn: "Saturn",
        Rahu: "Rahu",
        Ketu: "Ketu",
        Uranus: "Uranus",
        Neptune: "Neptune",
        Pluto: "Pluto",
        Ascendant: "Ascendant",
    },
};

const PLANET_SHORT = PLANET_NAMES.short;

// 12 Bhavas defined on standard 400x400 North Indian Kundli geometry:
// - Outer square: 0,0 to 400,400
// - Diagonals: (0,0)-(400,400) and (400,0)-(0,400)
// - Central Diamond: (200,0)-(400,200)-(200,400)-(0,200)
// - Coordinates are mathematically centered to guarantee zero text collision with diagonals or edges.
const HOUSE_DEFINITIONS = [
    {
        house: 1,
        points: "200,0 300,100 200,200 100,100",
        labelX: 200,
        labelY: 30,
        cx: 200,
        cy: 105,
        isDiamond: true,
    },
    {
        house: 2,
        points: "0,0 200,0 100,100",
        labelX: 65,
        labelY: 22,
        cx: 100,
        cy: 55,
        isDiamond: false,
    },
    {
        house: 3,
        points: "0,0 100,100 0,200",
        labelX: 22,
        labelY: 48,
        cx: 48,
        cy: 100,
        isDiamond: false,
    },
    {
        house: 4,
        points: "0,200 100,100 200,200 100,300",
        labelX: 100,
        labelY: 130,
        cx: 100,
        cy: 200,
        isDiamond: true,
    },
    {
        house: 5,
        points: "0,200 100,300 0,400",
        labelX: 22,
        labelY: 352,
        cx: 48,
        cy: 300,
        isDiamond: false,
    },
    {
        house: 6,
        points: "0,400 100,300 200,400",
        labelX: 65,
        labelY: 378,
        cx: 100,
        cy: 345,
        isDiamond: false,
    },
    {
        house: 7,
        points: "100,300 200,200 300,300 200,400",
        labelX: 200,
        labelY: 370,
        cx: 200,
        cy: 295,
        isDiamond: true,
    },
    {
        house: 8,
        points: "200,400 300,300 400,400",
        labelX: 335,
        labelY: 378,
        cx: 300,
        cy: 345,
        isDiamond: false,
    },
    {
        house: 9,
        points: "400,200 300,300 400,400",
        labelX: 378,
        labelY: 352,
        cx: 352,
        cy: 300,
        isDiamond: false,
    },
    {
        house: 10,
        points: "200,200 300,100 400,200 300,300",
        labelX: 300,
        labelY: 130,
        cx: 300,
        cy: 200,
        isDiamond: true,
    },
    {
        house: 11,
        points: "400,0 400,200 300,100",
        labelX: 378,
        labelY: 48,
        cx: 352,
        cy: 100,
        isDiamond: false,
    },
    {
        house: 12,
        points: "200,0 400,0 300,100",
        labelX: 335,
        labelY: 22,
        cx: 300,
        cy: 55,
        isDiamond: false,
    },
];

// Helper to compute responsive planet positions without overlapping borders or sign tags
const getPlanetLayout = (plList, cx, cy, isDiamond, displayMode = "standard") => {
    const count = plList.length;
    if (count === 0) return [];

    let fontSize = 11;
    let spacing = 13.5;

    if (count === 2) {
        fontSize = 10;
        spacing = 13;
    } else if (count === 3) {
        fontSize = 9;
        spacing = 11.5;
    } else if (count >= 4) {
        fontSize = 8;
        spacing = 10;
    }

    const startY = cy - ((count - 1) / 2) * spacing;
    const nameMap = PLANET_NAMES[displayMode] || PLANET_NAMES.standard;

    return plList.map((p, idx) => {
        let displayName = nameMap[p.cleanName] || p.cleanName;
        if (count >= 3 && displayName.length > 5) {
            displayName = PLANET_NAMES.standard[p.cleanName] || displayName.slice(0, 4);
        }

        return {
            ...p,
            displayName,
            x: cx,
            y: startY + idx * spacing,
            fontSize,
        };
    });
};

// North Indian Vedic Kundli Chart
const VedicChart = ({
    houses = [],
    planets = [],
    selectedHouse: externalSelected,
    onSelectHouse: externalOnSelect,
}) => {
    const [internalSelected, setInternalSelected] = useState(1);
    const [hoveredHouse, setHoveredHouse] = useState(null);
    const [displayMode, setDisplayMode] = useState("standard"); // "standard" | "short" | "full"

    const selectedHouse = externalSelected !== undefined ? externalSelected : internalSelected;
    const handleSelectHouse = (h) => {
        if (externalOnSelect) {
            externalOnSelect(h);
        } else {
            setInternalSelected(h);
        }
    };

    // Group planets by house and normalize retrograde status
    const planetsByHouse = {};
    planets.forEach((p) => {
        const h = Number(p.house);
        if (!planetsByHouse[h]) planetsByHouse[h] = [];
        const cleanName = (p.name || "").replace(/\(R\)/gi, "").trim();
        const isRetro = Boolean(p.isRetro || (p.name && p.name.includes("(R)")));
        planetsByHouse[h].push({
            ...p,
            cleanName,
            isRetro,
        });
    });

    return (
        <div className="w-full flex flex-col items-center">
            {/* Chart Toolbar */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#7c5800] uppercase tracking-wider">
                        Labels:
                    </span>
                    <div className="inline-flex rounded-lg p-0.5 bg-[#f4ece1] border border-[rgba(124,88,0,0.15)] text-[11px] font-semibold">
                        <button
                            type="button"
                            onClick={() => setDisplayMode("standard")}
                            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${displayMode === "standard"
                                ? "bg-white text-[#7c5800] shadow-xs font-bold"
                                : "text-[#5f5e5e] hover:text-[#7c5800]"
                                }`}
                        >
                            Standard
                        </button>
                        <button
                            type="button"
                            onClick={() => setDisplayMode("short")}
                            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${displayMode === "short"
                                ? "bg-white text-[#7c5800] shadow-xs font-bold"
                                : "text-[#5f5e5e] hover:text-[#7c5800]"
                                }`}
                        >
                            Vedic (Su, Mo)
                        </button>
                        <button
                            type="button"
                            onClick={() => setDisplayMode("full")}
                            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${displayMode === "full"
                                ? "bg-white text-[#7c5800] shadow-xs font-bold"
                                : "text-[#5f5e5e] hover:text-[#7c5800]"
                                }`}
                        >
                            Full
                        </button>
                    </div>
                </div>

                <div className="text-[11px] text-[#5f5e5e] flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#ffb800] animate-pulse" />
                    <span>Tap house to inspect</span>
                </div>
            </div>

            {/* Responsive Chart Container with fluid aspect ratio */}
            <div className="relative w-full max-w-[440px] sm:max-w-[470px] aspect-square mx-auto p-1 bg-[#fdfcf9] rounded-2xl shadow-sm border border-[rgba(124,88,0,0.25)]">
                <svg
                    viewBox="0 0 400 400"
                    className="w-full h-full select-none overflow-visible"
                >
                    {/* Base Background */}
                    <rect x="0" y="0" width="400" height="400" fill="#fdfcf9" />

                    {/* Interactive House Polygons */}
                    {HOUSE_DEFINITIONS.map(({ house, points }) => {
                        const isSelected = selectedHouse === house;
                        const isHovered = hoveredHouse === house;

                        return (
                            <polygon
                                key={house}
                                points={points}
                                className="cursor-pointer transition-all duration-150"
                                fill={
                                    isSelected
                                        ? "#ffb800"
                                        : isHovered
                                            ? "#ffb800"
                                            : "#fdfcf9"
                                }
                                fillOpacity={isSelected ? 0.24 : isHovered ? 0.12 : 1}
                                stroke={isSelected ? "#7c5800" : "transparent"}
                                strokeWidth={isSelected ? 2 : 0}
                                onClick={() => handleSelectHouse(house)}
                                onMouseEnter={() => setHoveredHouse(house)}
                                onMouseLeave={() => setHoveredHouse(null)}
                            />
                        );
                    })}

                    {/* Chart Structural Lines (pointer-events-none so polygons receive clicks) */}
                    <line x1="0" y1="0" x2="400" y2="400" stroke="#7c5800" strokeWidth="1.75" pointerEvents="none" />
                    <line x1="400" y1="0" x2="0" y2="400" stroke="#7c5800" strokeWidth="1.75" pointerEvents="none" />
                    <polygon
                        points="200,0 400,200 200,400 0,200"
                        fill="none"
                        stroke="#7c5800"
                        strokeWidth="1.75"
                        pointerEvents="none"
                    />
                    <rect
                        x="0"
                        y="0"
                        width="400"
                        height="400"
                        fill="none"
                        stroke="#7c5800"
                        strokeWidth="3"
                        pointerEvents="none"
                    />

                    {/* House Content: Zodiac Sign Badges & Occupying Planets */}
                    {HOUSE_DEFINITIONS.map(({ house, labelX, labelY, cx, cy, isDiamond }) => {
                        const houseData = houses.find((h) => Number(h.house) === house);
                        const signInfo = getSignInfo(houseData?.sign);
                        const plList = planetsByHouse[house] || [];
                        const formattedPlanets = getPlanetLayout(plList, cx, cy, isDiamond, displayMode);
                        const isSelected = selectedHouse === house;

                        return (
                            <g
                                key={house}
                                className="cursor-pointer"
                                onClick={() => handleSelectHouse(house)}
                            >
                                {/* Zodiac Sign Badge */}
                                <g className="select-none pointer-events-none">
                                    <text
                                        x={labelX}
                                        y={labelY - 5}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className={`font-bold tracking-tight text-[8.5px] transition-colors ${isSelected ? "fill-[#5c3e00]" : "fill-[#7c5800]"
                                            }`}
                                    >
                                        {signInfo.short || (houseData?.sign ? houseData.sign.slice(0, 3) : `H${house}`)}
                                    </text>
                                    <text
                                        x={labelX}
                                        y={labelY + 5}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="fill-[#9e7616] text-[7.5px] font-bold"
                                    >
                                        {signInfo.num ? `${signInfo.num}` : `${house}`}
                                    </text>
                                </g>

                                {/* Occupying Planets with Dynamic Spacing & Superscript Retrograde */}
                                {formattedPlanets.map((p, idx) => (
                                    <text
                                        key={`${p.cleanName}-${idx}`}
                                        x={p.x}
                                        y={p.y}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="fill-[#1a1a1a] font-bold select-none pointer-events-none"
                                        style={{ fontSize: `${p.fontSize}px` }}
                                    >
                                        {p.displayName}
                                        {p.isRetro && (
                                            <tspan
                                                dx="1"
                                                dy="-2"
                                                className="fill-[#dc2626] font-black text-[7.5px]"
                                            >
                                                ᴿ
                                            </tspan>
                                        )}
                                    </text>
                                ))}
                            </g>
                        );
                    })}
                </svg>
            </div>

            <p className="text-[11px] sm:text-xs text-[#5f5e5e] text-center mt-3 tracking-wide">
                Classic North Indian Lagna Kundli • Top Diamond = House 1 (Lagna) • Anti-clockwise sequence
            </p>
        </div>
    );
};

// Interactive Companion House Inspector Panel
const HouseInspector = ({ houseNum, houses = [], planets = [], onSelectHouse }) => {
    const houseObj = houses.find((h) => Number(h.house) === Number(houseNum)) || {};
    const signInfo = getSignInfo(houseObj.sign);
    const houseInfo = HOUSE_INFO[houseNum] || {
        name: `House ${houseNum}`,
        sanskrit: "",
        meaning: "",
    };
    const housePlanets = planets.filter((p) => Number(p.house) === Number(houseNum));

    return (
        <div className="bg-[#fcfaf7] border border-[#ffb800]/40 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4">
            {/* Quick House Navigation Tabs */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c5800]">
                        House Navigator
                    </span>
                    <span className="text-[10px] text-[#5f5e5e]">
                        Dots indicate planets
                    </span>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-6 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                        const isSelected = Number(houseNum) === num;
                        const hasPlanets = planets.some((p) => Number(p.house) === num);
                        return (
                            <button
                                key={num}
                                type="button"
                                onClick={() => onSelectHouse(num)}
                                className={`relative py-1.5 px-1 rounded-lg text-xs font-bold transition cursor-pointer text-center ${isSelected
                                    ? "bg-[#7c5800] text-white shadow-xs"
                                    : "bg-white text-[#5f5e5e] hover:bg-[#fff9ed] hover:text-[#7c5800] border border-[rgba(26,26,26,0.08)]"
                                    }`}
                            >
                                H{num}
                                {hasPlanets && (
                                    <span
                                        className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-[#ffb800]" : "bg-[#7c5800]"
                                            }`}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected House Details Card */}
            <div className="bg-white rounded-xl p-4 border border-[rgba(26,26,26,0.08)] shadow-xs">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold uppercase tracking-wider bg-[#fff9ed] text-[#7c5800] px-2.5 py-0.5 rounded-full border border-[#ffb800]/30">
                                House {houseNum} {houseNum === 1 ? "• Lagna" : ""}
                            </span>
                            {houseInfo.sanskrit && (
                                <span className="text-xs font-medium text-[#5f5e5e]">
                                    ({houseInfo.sanskrit})
                                </span>
                            )}
                        </div>
                        <h4 className="font-['Playfair_Display',Georgia,serif] text-xl font-bold text-[#1a1a1a] mt-1.5">
                            {houseObj.sign || "—"}{" "}
                            <span className="text-sm font-normal text-[#5f5e5e]">
                                {signInfo.sanskrit ? `(${signInfo.sanskrit})` : ""}
                            </span>
                        </h4>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-[#7c5800] block">
                            Rashi #{signInfo.num || houseNum}
                        </span>
                        {signInfo.lord && (
                            <span className="text-[11px] text-[#5f5e5e] block">
                                Lord: <strong className="text-[#1a1a1a]">{signInfo.lord}</strong>
                            </span>
                        )}
                    </div>
                </div>

                <p className="text-xs text-[#5f5e5e] mt-2.5 pt-2.5 border-t border-[rgba(26,26,26,0.06)] leading-relaxed">
                    <strong className="text-[#7c5800]">Signifies:</strong> {houseInfo.meaning}
                </p>
                {houseObj.degree && (
                    <p className="text-[11px] text-[#5f5e5e] mt-1 font-mono">
                        House Cusp: {houseObj.degree.toFixed(2)}°
                    </p>
                )}
            </div>

            {/* Occupying Planets */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7c5800] flex items-center gap-1.5">
                        <span>🪐</span> Occupying Planets ({housePlanets.length})
                    </span>
                    {housePlanets.length > 0 && (
                        <span className="text-[10px] text-[#5f5e5e]">
                            Exact degrees & nakshatra
                        </span>
                    )}
                </div>

                {housePlanets.length === 0 ? (
                    <div className="bg-white/80 rounded-xl p-4 text-center border border-dashed border-[rgba(26,26,26,0.15)] text-xs text-[#5f5e5e]">
                        No planets directly occupying this house.
                        <p className="text-[10px] text-[#8c8985] mt-0.5">
                            House results are channeled through House Lord ({signInfo.lord || "Ruler"}) and planetary aspects.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {housePlanets.map((p, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-xl p-3 border border-[rgba(26,26,26,0.08)] flex items-center justify-between gap-3 shadow-xs hover:border-[#ffb800]/50 transition"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-[#fff9ed] border border-[#ffb800]/40 flex items-center justify-center font-bold text-xs text-[#7c5800] flex-shrink-0">
                                        {PLANET_SHORT[p.name.replace(/\(R\)/g, "").trim()] || p.name.slice(0, 2)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-sm text-[#1a1a1a] truncate">
                                                {p.name.replace(/\(R\)/g, "").trim()}
                                            </span>
                                            {(p.isRetro || p.name.includes("(R)")) && (
                                                <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold flex-shrink-0">
                                                    Retrograde
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-[#5f5e5e] truncate">
                                            {p.nakshatra ? `Nakshatra: ${p.nakshatra}` : `Zodiac: ${p.sign}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <span className="text-xs font-mono font-semibold text-[#7c5800] bg-[#fcfaf7] px-2 py-0.5 rounded border border-[#f4ece1]">
                                        {p.degree ? `${p.degree.toFixed(2)}°` : "—"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
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

const ReadingSection = ({ reading, loading, onGenerate, lang, setLang, onClearReading }) => {
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
            <div className="text-center py-8 sm:py-12 px-4 sm:px-6 bg-[#fdfcf9] rounded-2xl border border-[rgba(26,26,26,0.08)]">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-[#ffb800] mx-auto mb-3 animate-pulse" />
                <h3 className="font-['Playfair_Display',Georgia,serif] text-lg sm:text-xl md:text-2xl font-bold text-[#1a1a1a] mb-2 leading-snug">
                    Reveal Your Personalized AI Horoscope & Kundli Reading
                </h3>
                <p className="text-xs sm:text-sm text-[#5f5e5e] max-w-md mx-auto mb-6 leading-relaxed">
                    Our Vedic AI analyzes your planetary placements, lagna lord, and current dasha to generate in-depth insights into your destiny, career, love, and health.
                </p>

                <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-6 flex-wrap">
                    <span className="text-xs font-semibold text-[#5f5e5e] uppercase tracking-wider">Language:</span>
                    <button
                        type="button"
                        onClick={() => setLang("en")}
                        className={`px-3.5 py-1 text-xs rounded-full font-medium transition cursor-pointer ${lang === "en" ? "bg-[#7c5800] text-white" : "bg-[#f4ece1] text-[#5f5e5e]"
                            }`}
                    >
                        English
                    </button>
                    <button
                        type="button"
                        onClick={() => setLang("hi")}
                        className={`px-3.5 py-1 text-xs rounded-full font-medium transition cursor-pointer ${lang === "hi" ? "bg-[#7c5800] text-white" : "bg-[#f4ece1] text-[#5f5e5e]"
                            }`}
                    >
                        हिंदी (Hindi)
                    </button>
                </div>

                <button
                    onClick={() => onGenerate(lang)}
                    className="w-full sm:w-auto bg-[#ffb800] hover:bg-[#ffba20] text-[#6b4c00] font-bold px-6 sm:px-8 py-3 rounded-full transition shadow-md active:scale-95 cursor-pointer text-sm sm:text-base inline-flex items-center justify-center gap-2"
                >
                    <span>✨</span> Generate AI Vedic Reading
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
                            // Clear stale reading first so the UI resets to the generate prompt
                            onClearReading();
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

const KundliDetail = ({ kundli, reading, readingLoading, onGetReading, onDelete, onClearReading }) => {
    const [tab, setTab] = useState("chart");
    const [readingLang, setReadingLang] = useState("en");
    const [selectedHouse, setSelectedHouse] = useState(1);

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
            <div className="tab-rail no-scrollbar border-b border-[rgba(26,26,26,0.08)] gap-1 px-1">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-1.5 py-2.5 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer rounded-t-xl flex-shrink-0 ${tab === t.key
                            ? "bg-white text-[#7c5800] border-t-2 border-[#ffb800] shadow-sm"
                            : "text-[#5f5e5e] hover:text-[#7c5800]"
                            }`}
                    >
                        <span>{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Panes */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-6 border border-[rgba(26,26,26,0.08)] shadow-sm">
                {tab === "chart" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-7 flex flex-col items-center">
                            <VedicChart
                                houses={kundli.houses}
                                planets={kundli.planets}
                                selectedHouse={selectedHouse}
                                onSelectHouse={setSelectedHouse}
                            />
                        </div>
                        <div className="lg:col-span-5 w-full">
                            <HouseInspector
                                houseNum={selectedHouse}
                                houses={kundli.houses}
                                planets={kundli.planets}
                                onSelectHouse={setSelectedHouse}
                            />
                        </div>
                    </div>
                )}

                {tab === "planets" && (
                    <div>
                        {/* Mobile view: Responsive modern cards */}
                        <div className="block sm:hidden space-y-2.5">
                            {kundli.planets?.map((p) => {
                                const cleanName = p.name.replace(/\(R\)/gi, "").trim();
                                const isRetro = Boolean(p.isRetro || p.name.includes("(R)"));
                                const shortCode = PLANET_SHORT[cleanName] || cleanName.slice(0, 2);
                                const signInfo = getSignInfo(p.sign);

                                return (
                                    <div
                                        key={p.name}
                                        className="bg-[#fcfaf7] border border-[#f4ece1] rounded-xl p-3.5 shadow-2xs"
                                    >
                                        <div className="flex items-center justify-between mb-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-[#fff9ed] border border-[#ffb800]/40 flex items-center justify-center font-bold text-xs text-[#7c5800]">
                                                    {shortCode}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-[#1a1a1a] text-sm">
                                                            {cleanName}
                                                        </span>
                                                        {isRetro && (
                                                            <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">
                                                                Retrograde
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-[#7c5800] font-medium">
                                                        House {p.house} • {HOUSE_INFO[p.house]?.sanskrit || `Bhava ${p.house}`}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-xs font-mono font-bold text-[#7c5800] bg-white px-2 py-0.5 rounded border border-[#f4ece1]">
                                                    {p.degree ? `${p.degree.toFixed(2)}°` : "—"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[rgba(26,26,26,0.06)] text-[11px]">
                                            <div className="bg-white/80 p-2 rounded-lg border border-[rgba(26,26,26,0.04)]">
                                                <span className="text-[#5f5e5e] text-[10px] uppercase font-semibold block">Zodiac Sign</span>
                                                <span className="font-bold text-[#1a1a1a]">
                                                    {p.sign} {signInfo.num ? `(#${signInfo.num})` : ""}
                                                </span>
                                            </div>
                                            <div className="bg-white/80 p-2 rounded-lg border border-[rgba(26,26,26,0.04)]">
                                                <span className="text-[#5f5e5e] text-[10px] uppercase font-semibold block">Nakshatra</span>
                                                <span className="font-medium text-[#1a1a1a] truncate block">
                                                    {p.nakshatra || "—"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop view: Table */}
                        <div className="hidden sm:block overflow-x-auto">
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
                                    className={`flex justify-between items-center p-3.5 rounded-xl transition ${isCurrent
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
                        reading={reading}
                        loading={readingLoading}
                        lang={readingLang}
                        setLang={setReadingLang}
                        onGenerate={(selectedLang) => onGetReading(kundli._id, selectedLang)}
                        onClearReading={onClearReading}
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
        clearReading,
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

            <main className="grow w-full max-w-5xl mx-auto px-3 sm:px-6 md:px-10 pt-20 sm:pt-24 md:pt-28 pb-20">
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
                                    className={`px-4 py-1.5 rounded-full transition cursor-pointer ${view === "create"
                                        ? "bg-[#7c5800] text-white shadow-sm"
                                        : "text-[#5f5e5e] hover:text-[#7c5800]"
                                        }`}
                                >
                                    + New Kundli
                                </button>
                                <button
                                    onClick={() => setView("list")}
                                    className={`px-4 py-1.5 rounded-full transition cursor-pointer ${view === "list"
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
                        onClearReading={clearReading}
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