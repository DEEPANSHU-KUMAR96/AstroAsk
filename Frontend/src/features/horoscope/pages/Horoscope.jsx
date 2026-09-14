import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Sparkles,
    Star,
    Heart,
    Briefcase,
    Wallet,
    Calendar,
    Hash,
    RefreshCw,
    LogOut,
    User,
} from "lucide-react";
import useHoroscope from "../hooks/usehoroscope";
import useAuth from "../../auth/hooks/useAuth";
import Navbar from "../../../app/components/Navbar";

const ZODIAC_SIGNS = [
    { id: "aries", name: "Aries", date: "MAR 21 - APR 19", element: "FIRE SIGN", color: "#E05A47", hex: "#E05A47" },
    { id: "taurus", name: "Taurus", date: "APR 20 - MAY 20", element: "EARTH SIGN", color: "#5B8C5A", hex: "#5B8C5A" },
    { id: "gemini", name: "Gemini", date: "MAY 21 - JUN 20", element: "AIR SIGN", color: "#E5A93C", hex: "#E5A93C" },
    { id: "cancer", name: "Cancer", date: "JUN 21 - JUL 22", element: "WATER SIGN", color: "#4A90E2", hex: "#4A90E2" },
    { id: "leo", name: "Leo", date: "JUL 23 - AUG 22", element: "FIRE SIGN", color: "Saffron", hex: "#F4C430" },
    { id: "virgo", name: "Virgo", date: "AUG 23 - SEP 22", element: "EARTH SIGN", color: "#8B9D77", hex: "#8B9D77" },
    { id: "libra", name: "Libra", date: "SEP 23 - OCT 22", element: "AIR SIGN", color: "#D48BA3", hex: "#D48BA3" },
    { id: "scorpio", name: "Scorpio", date: "OCT 23 - NOV 21", element: "WATER SIGN", color: "#8E2800", hex: "#8E2800" },
    { id: "sagittarius", name: "Sagittarius", date: "NOV 22 - DEC 21", element: "FIRE SIGN", color: "#9B59B6", hex: "#9B59B6" },
    { id: "capricorn", name: "Capricorn", date: "DEC 22 - JAN 19", element: "EARTH SIGN", color: "#5D6D7E", hex: "#5D6D7E" },
    { id: "aquarius", name: "Aquarius", date: "JAN 20 - FEB 18", element: "AIR SIGN", color: "#2E86C1", hex: "#2E86C1" },
    { id: "pisces", name: "Pisces", date: "FEB 19 - MAR 20", element: "WATER SIGN", color: "#16A085", hex: "#16A085" },
];

const PERIODS = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
];

const Horoscope = () => {
    const { user, isAuthenticated, handleLogout } = useAuth();
    const {
        horoscope,
        selectedSign,
        selectedPeriod,
        selectedLang,
        streamingContent,
        isStreaming,
        loading,
        error,
        getHoroscope,
        changeSign,
        changePeriod,
        changeLang,
    } = useHoroscope();

    useEffect(() => {
        getHoroscope({ sign: selectedSign, period: selectedPeriod, lang: selectedLang });
    }, [selectedSign, selectedPeriod, selectedLang]);

    const currentSignInfo =
        ZODIAC_SIGNS.find((s) => s.id.toLowerCase() === selectedSign.toLowerCase()) ||
        ZODIAC_SIGNS[0];

    const content = horoscope?.content || {};
    const lucky = content.lucky || {};
    const rating = content.rating ?? 4;

    const generalReading =
        streamingContent ||
        content.general ||
        content.horoscope ||
        content.prediction ||
        content.description ||
        "";

    const heroSummary =
        content.summary ||
        content.today ||
        content.general ||
        "";

    const luckyNumber = lucky.number ?? lucky.lucky_number ?? "—";
    const luckyColor = lucky.color || lucky.lucky_color || currentSignInfo.color;
    const luckyColorHex = lucky.color_code || currentSignInfo.hex;
    const luckyDay = lucky.day || lucky.lucky_day || "—";

    const loveReading = content.love || "";
    const careerReading = content.career || "";
    const financeReading = content.finance || content.money || "";


    return (
        <div className="min-h-screen flex flex-col bg-[#fbf9f8] text-[#1b1c1c] font-['Inter',sans-serif] selection:bg-[#ffb800] selection:text-[#1a1a1a]">
            {/* Top Navigation */}
            <Navbar />

            {/* Main Content */}
            <main className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 pt-24 md:pt-28 pb-20">
                {error && (
                    <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                        <span className="font-semibold">Error:</span>
                        <span>{typeof error === "string" ? error : "Failed to load horoscope. Please try again."}</span>
                        <button
                            onClick={() => getHoroscope({ sign: selectedSign, period: selectedPeriod, lang: selectedLang })}
                            className="ml-auto text-xs font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Controls: Sign, Period, Language */}
                <div className="flex flex-col gap-4 mb-10 lg:mb-14">
                    {/* Signs Scrollable Bar — hidden scrollbar + mask fade at edges */}
                    <div className="tab-rail no-scrollbar scroll-fade-x gap-5 sm:gap-7 pb-3 border-b border-[rgba(26,26,26,0.1)] px-2">
                        {ZODIAC_SIGNS.map((s) => {
                            const isActive = selectedSign.toLowerCase() === s.id.toLowerCase();
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => changeSign(s.id)}
                                    className={`relative text-[11px] sm:text-xs uppercase tracking-[0.13em] font-semibold pb-3 whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 outline-none focus:outline-none ${
                                        isActive ? "text-[#7c5800]" : "text-[#5f5e5e] hover:text-[#7c5800]"
                                    }`}
                                >
                                    {s.name}
                                    {/* Gold underline — rendered as absolute span, never shows as a box */}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffb800] rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Period + Language — row on all screen sizes */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        {/* Period Pills */}
                        <div className="flex gap-1 bg-[#f5f3f3] p-1 rounded-full border border-[rgba(26,26,26,0.08)] shadow-inner">
                            {PERIODS.map((p) => {
                                const isActive = selectedPeriod.toLowerCase() === p.id.toLowerCase();
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => changePeriod(p.id)}
                                        className={`text-[11px] sm:text-xs uppercase tracking-[0.13em] font-semibold px-4 sm:px-5 py-1.5 sm:py-2 rounded-full transition-all duration-200 cursor-pointer outline-none focus:outline-none ${
                                            isActive
                                                ? "bg-[#fdfcf9] shadow-sm text-[#7c5800]"
                                                : "text-[#5f5e5e] hover:text-[#7c5800]"
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Language Selector */}
                        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-[0.13em] border border-[rgba(26,26,26,0.1)] bg-[#fdfcf9] rounded-full px-4 py-1.5 sm:py-2">
                            <button
                                onClick={() => changeLang("en")}
                                className={`cursor-pointer transition-colors ${
                                    selectedLang === "en"
                                        ? "text-[#7c5800] font-bold"
                                        : "text-[#5f5e5e] hover:text-[#7c5800]"
                                }`}
                            >
                                EN
                            </button>
                            <span className="text-[rgba(26,26,26,0.2)]">|</span>
                            <button
                                onClick={() => changeLang("hi")}
                                className={`cursor-pointer transition-colors ${
                                    selectedLang === "hi"
                                        ? "text-[#7c5800] font-bold"
                                        : "text-[#5f5e5e] hover:text-[#7c5800]"
                                }`}
                            >
                                HI
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <section className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-12 mb-10 lg:mb-20 items-center">
                    {/* Sign image — small on mobile, right col on desktop */}
                    <div className="lg:col-span-5 lg:order-2 flex justify-center">
                        <div className="w-44 h-44 sm:w-60 sm:h-60 lg:w-full lg:max-w-[380px] lg:aspect-square relative rounded-full flex items-center justify-center p-4 bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.08)] shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
                            <div className="absolute inset-0 border border-[#ffb800]/25 rounded-full m-2 pointer-events-none" />
                            <img
                                className="w-full h-full object-contain mix-blend-multiply opacity-90 rounded-full transition-transform duration-700 hover:scale-105"
                                alt={`${currentSignInfo.name} Zodiac Celestial Illustration`}
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp-kG4pgRNZLfip_DkTJyj4z8iabhco4q8H8RI_shCgVYedfA_ULQ1DLGNc6GsngHnr7SeLLLu2wCUuk24hnLIekHrfT0w7kH3dyExtWZv9YMk-oVLu3P8ABuMzgvhd7lCWTo2kz8Owrf0-74vDWLvHcqCIybjLyYttseBLz0Ux69dWWHyO2o4FvhaPSt_p09LIp81JAD-g081t6Klag7Ffu143nwgfwQG0qBJsWWqarF-t2pWIeNv"
                            />
                        </div>
                    </div>

                    {/* Sign text — always below image on mobile, left col on desktop */}
                    <div className="lg:col-span-7 lg:order-1 flex flex-col justify-center text-center lg:text-left">
                        <h1 className="font-['Playfair_Display',Georgia,serif] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#1a1a1a] mb-2 tracking-tight">
                            {currentSignInfo.name}
                        </h1>
                        <p className="text-[11px] sm:text-xs uppercase font-semibold text-[#ffb800] tracking-[0.2em] mb-4">
                            {currentSignInfo.date} • {currentSignInfo.element}
                        </p>

                        <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
                            <span className="text-[10px] sm:text-xs uppercase font-semibold tracking-[0.15em] text-[#5f5e5e] mr-2">
                                TODAY'S ENERGY
                            </span>
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                        key={i}
                                        size={15}
                                        fill={i < rating ? "#ffb800" : "#e2dfde"}
                                        strokeWidth={0}
                                    />
                                ))}
                            </div>
                        </div>

                        <p className="text-sm sm:text-base text-[#514532] leading-relaxed max-w-xl mx-auto lg:mx-0">
                            {heroSummary}
                        </p>

                        {loading && (
                            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#7c5800] uppercase tracking-wider mt-3 justify-center lg:justify-start">
                                <RefreshCw size={13} className="animate-spin" />
                                <span>Aligning cosmic insights...</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Bento Grid: Detailed Readings */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
                    {/* Main Reading Card */}
                    <div className="md:col-span-8 bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.1)] p-5 sm:p-8 lg:p-10 rounded-2xl flex flex-col justify-between shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
                        <div>
                            <div className="flex items-center gap-3 mb-4 sm:mb-6 border-b border-[rgba(26,26,26,0.1)] pb-4">
                                <Sparkles size={18} className="text-[#7c5800] flex-shrink-0" />
                                <h2 className="font-['Playfair_Display',Georgia,serif] text-xl sm:text-2xl lg:text-3xl font-semibold text-[#1a1a1a]">
                                    General Reading
                                </h2>
                                {isStreaming && (
                                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#ffb800]/20 text-[#7c5800] animate-pulse">
                                        Live Stream
                                    </span>
                                )}
                            </div>
                            <p className="text-sm sm:text-base text-[#514532] leading-relaxed whitespace-pre-line">
                                {generalReading}
                            </p>
                        </div>
                    </div>

                    {/* Lucky Details Sidebar */}
                    <div className="md:col-span-4 grid grid-cols-3 md:grid-cols-1 gap-3 sm:gap-4">
                        <div className="bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.1)] p-4 sm:p-6 rounded-2xl flex items-center justify-between shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
                            <div>
                                <span className="text-[10px] sm:text-[11px] uppercase font-semibold tracking-[0.12em] text-[#5f5e5e] block mb-1">LUCKY NUMBER</span>
                                <span className="font-['Playfair_Display',Georgia,serif] text-3xl sm:text-4xl font-bold text-[#1a1a1a]">{luckyNumber}</span>
                            </div>
                            <Hash size={24} className="text-[#837560] opacity-20 flex-shrink-0" />
                        </div>

                        <div className="bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.1)] p-4 sm:p-6 rounded-2xl flex items-center justify-between shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
                            <div className="min-w-0">
                                <span className="text-[10px] sm:text-[11px] uppercase font-semibold tracking-[0.12em] text-[#5f5e5e] block mb-1">LUCKY COLOR</span>
                                <span className="font-['Playfair_Display',Georgia,serif] text-lg sm:text-2xl font-semibold text-[#1a1a1a] block truncate">{luckyColor}</span>
                            </div>
                            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-[rgba(26,26,26,0.1)] shadow-inner flex-shrink-0 ml-2" style={{ backgroundColor: luckyColorHex }} />
                        </div>

                        <div className="bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.1)] p-4 sm:p-6 rounded-2xl flex items-center justify-between shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
                            <div>
                                <span className="text-[10px] sm:text-[11px] uppercase font-semibold tracking-[0.12em] text-[#5f5e5e] block mb-1">LUCKY DAY</span>
                                <span className="font-['Playfair_Display',Georgia,serif] text-lg sm:text-2xl font-semibold text-[#1a1a1a]">{luckyDay}</span>
                            </div>
                            <Calendar size={24} className="text-[#837560] opacity-20 flex-shrink-0" />
                        </div>
                    </div>

                    {/* Love / Career / Finance Cards */}
                    <div className="md:col-span-4 bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.1)] p-5 sm:p-7 rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 mb-3">
                            <Heart size={17} className="text-[#ba1a1a]" />
                            <h3 className="font-['Playfair_Display',Georgia,serif] text-lg sm:text-xl font-semibold text-[#1a1a1a]">Love</h3>
                        </div>
                        <p className="text-sm text-[#514532] leading-relaxed">{loveReading}</p>
                    </div>

                    <div className="md:col-span-4 bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.1)] p-5 sm:p-7 rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 mb-3">
                            <Briefcase size={17} className="text-[#7c5800]" />
                            <h3 className="font-['Playfair_Display',Georgia,serif] text-lg sm:text-xl font-semibold text-[#1a1a1a]">Career</h3>
                        </div>
                        <p className="text-sm text-[#514532] leading-relaxed">{careerReading}</p>
                    </div>

                    <div className="md:col-span-4 bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.1)] p-5 sm:p-7 rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 mb-3">
                            <Wallet size={17} className="text-[#7c5800]" />
                            <h3 className="font-['Playfair_Display',Georgia,serif] text-lg sm:text-xl font-semibold text-[#1a1a1a]">Finance</h3>
                        </div>
                        <p className="text-sm text-[#514532] leading-relaxed">{financeReading}</p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#fbf9f8] w-full border-t border-[rgba(26,26,26,0.1)] py-8 sm:py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                    <div>
                        <span className="font-['Playfair_Display',Georgia,serif] text-xl font-semibold text-[#7c5800]">AstroAsk</span>
                        <p className="text-xs text-[#5f5e5e] mt-1.5 opacity-80 max-w-xs">
                            © 2024 AstroAsk. The stars incline, they do not bind.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#5f5e5e]">
                        {["About Us", "Contact", "Terms", "Privacy", "Careers"].map((l) => (
                            <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-[#7c5800] transition-colors">{l}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Horoscope;
