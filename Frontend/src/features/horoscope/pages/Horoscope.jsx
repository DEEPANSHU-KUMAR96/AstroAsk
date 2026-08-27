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
            <nav className="bg-[#fdfcf9]/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-[rgba(26,26,26,0.1)] shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-500">
                <div className="flex justify-between items-center max-w-360 mx-auto px-6 md:px-16 lg:px-24 py-5">
                    <Link
                        to="/horoscope"
                        className="font-['Playfair_Display',Georgia,serif] text-2xl md:text-3xl font-semibold text-[#7c5800] tracking-tight hover:opacity-90 transition-opacity"
                    >
                        AstroAsk
                    </Link>

                    <div className="hidden md:flex gap-8 text-xs font-semibold uppercase tracking-[0.15em]">
                        <Link
                            to="/horoscope"
                            className="text-[#7c5800] border-b-2 border-[#7c5800] pb-1 transition-colors"
                        >
                            Horoscopes
                        </Link>
                        <a
                            href="#live-chat"
                            className="text-[#5f5e5e] hover:text-[#7c5800] transition-colors"
                        >
                            Live Chat
                        </a>
                        <a
                            href="#kundli"
                            className="text-[#5f5e5e] hover:text-[#7c5800] transition-colors"
                        >
                            Kundli
                        </a>
                        <a
                            href="#tarot"
                            className="text-[#5f5e5e] hover:text-[#7c5800] transition-colors"
                        >
                            Tarot
                        </a>
                    </div>

                    <div className="flex gap-3 text-xs font-semibold uppercase tracking-[0.15em] items-center">
                        {isAuthenticated && user ? (
                            <>
                                <div className="hidden sm:flex items-center gap-2 text-[#5f5e5e] normal-case tracking-normal">
                                    <div className="w-7 h-7 rounded-full bg-[#ffb800]/20 border border-[#ffb800]/40 flex items-center justify-center">
                                        <User size={14} className="text-[#7c5800]" />
                                    </div>
                                    <span className="text-[#1a1a1a] font-medium text-sm">{user.name || user.email}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 text-[#5f5e5e] hover:text-[#7c5800] px-3 py-2 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={14} />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-[#5f5e5e] hover:text-[#7c5800] px-3 py-2 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-[#ffb800] text-[#6b4c00] px-5 md:px-6 py-2.5 rounded-full hover:bg-[#ffba20] transition-colors shadow-sm font-bold"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="grow w-full max-w-360 mx-auto px-6 md:px-16 lg:px-24 pt-28 md:pt-32 pb-20">
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
                <div className="flex flex-col lg:flex-row justify-between items-center mb-12 lg:mb-16 gap-6">
                    {/* Signs Scrollable Bar */}
                    <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-2 w-full lg:w-auto border-b border-[rgba(26,26,26,0.1)] lg:border-none no-scrollbar">
                        {ZODIAC_SIGNS.map((s) => {
                            const isActive = selectedSign.toLowerCase() === s.id.toLowerCase();
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => changeSign(s.id)}
                                    className={`text-xs uppercase tracking-[0.15em] font-semibold pb-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${isActive
                                            ? "text-[#7c5800] border-b-2 border-[#7c5800] scale-105"
                                            : "text-[#5f5e5e] hover:text-[#7c5800]"
                                        }`}
                                >
                                    {s.name}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 w-full lg:w-auto">
                        {/* Period Pills */}
                        <div className="flex gap-1 bg-[#f5f3f3] p-1.5 rounded-full border border-[rgba(26,26,26,0.1)] shadow-inner">
                            {PERIODS.map((p) => {
                                const isActive = selectedPeriod.toLowerCase() === p.id.toLowerCase();
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => changePeriod(p.id)}
                                        className={`text-xs uppercase tracking-[0.15em] font-semibold px-5 py-2 rounded-full transition-all duration-200 cursor-pointer ${isActive
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
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] border border-[rgba(26,26,26,0.1)] bg-[#fdfcf9] rounded-full px-4 py-2">
                            <button
                                onClick={() => changeLang("en")}
                                className={`cursor-pointer transition-colors ${selectedLang === "en"
                                        ? "text-[#7c5800] font-bold"
                                        : "text-[#5f5e5e] hover:text-[#7c5800]"
                                    }`}
                            >
                                EN
                            </button>
                            <span className="text-[rgba(26,26,26,0.2)]">|</span>
                            <button
                                onClick={() => changeLang("hi")}
                                className={`cursor-pointer transition-colors ${selectedLang === "hi"
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
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 lg:mb-24 items-center">
                    <div className="lg:col-span-6 flex flex-col justify-center order-2 lg:order-1">
                        <h1 className="font-['Playfair_Display',Georgia,serif] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1a1a1a] mb-3 tracking-tight">
                            {currentSignInfo.name}
                        </h1>
                        <p className="text-xs uppercase font-semibold text-[#ffb800] tracking-[0.2em] mb-6">
                            {currentSignInfo.date} • {currentSignInfo.element}
                        </p>

                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-xs uppercase font-semibold tracking-[0.15em] text-[#5f5e5e] mr-3">
                                TODAY'S ENERGY
                            </span>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        fill={i < rating ? "#ffb800" : "#e2dfde"}
                                        strokeWidth={0}
                                    />
                                ))}
                            </div>
                        </div>

                        <p className="text-base sm:text-lg text-[#514532] leading-relaxed max-w-xl">
                            {heroSummary}
                        </p>

                        {loading && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#7c5800] uppercase tracking-wider mt-4">
                                <RefreshCw size={14} className="animate-spin" />
                                <span>Aligning cosmic insights...</span>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center lg:justify-end">
                        <div className="w-full max-w-[340px] sm:max-w-[400px] aspect-square relative rounded-full flex items-center justify-center p-6 bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.1)] shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
                            <div className="absolute inset-0 border border-[#ffb800]/30 rounded-full m-3 pointer-events-none"></div>
                            <img
                                className="w-full h-full object-contain mix-blend-multiply opacity-90 rounded-full p-2 transition-transform duration-700 hover:scale-105"
                                alt={`${currentSignInfo.name} Zodiac Celestial Illustration`}
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp-kG4pgRNZLfip_DkTJyj4z8iabhco4q8H8RI_shCgVYedfA_ULQ1DLGNc6GsngHnr7SeLLLu2wCUuk24hnLIekHrfT0w7kH3dyExtWZv9YMk-oVLu3P8ABuMzgvhd7lCWTo2kz8Owrf0-74vDWLvHcqCIybjLyYttseBLz0Ux69dWWHyO2o4FvhaPSt_p09LIp81JAD-g081t6Klag7Ffu143nwgfwQG0qBJsWWqarF-t2pWIeNv"
                            />
                        </div>
                    </div>
                </section>

                {/* Bento Grid: Detailed Readings */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
                    {/* Main Reading Card */}
                    <div className="md:col-span-8 bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.1)] p-8 sm:p-12 lg:p-14 rounded-2xl flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                        <div>
                            <div className="flex items-center gap-3 mb-6 border-b border-[rgba(26,26,26,0.1)] pb-4">
                                <Sparkles size={22} className="text-[#7c5800]" />
                                <h2 className="font-['Playfair_Display',Georgia,serif] text-2xl sm:text-3xl font-semibold text-[#1a1a1a]">
                                    General Reading
                                </h2>
                                {isStreaming && (
                                    <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffb800]/20 text-[#7c5800] animate-pulse">
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
                    <div className="md:col-span-4 flex flex-col gap-6">
                        <div className="bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.1)] p-6 sm:p-8 rounded-2xl flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                            <div>
                                <span className="text-[11px] uppercase font-semibold tracking-[0.15em] text-[#5f5e5e] block mb-1">
                                    LUCKY NUMBER
                                </span>
                                <span className="font-['Playfair_Display',Georgia,serif] text-4xl sm:text-5xl font-bold text-[#1a1a1a]">
                                    {luckyNumber}
                                </span>
                            </div>
                            <Hash size={32} className="text-[#837560] opacity-20" />
                        </div>

                        <div className="bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.1)] p-6 sm:p-8 rounded-2xl flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                            <div>
                                <span className="text-[11px] uppercase font-semibold tracking-[0.15em] text-[#5f5e5e] block mb-1">
                                    LUCKY COLOR
                                </span>
                                <span className="font-['Playfair_Display',Georgia,serif] text-2xl sm:text-3xl font-semibold text-[#1a1a1a] block">
                                    {luckyColor}
                                </span>
                            </div>
                            <div
                                className="w-12 h-12 rounded-full border border-[rgba(26,26,26,0.1)] shadow-inner flex-shrink-0"
                                style={{ backgroundColor: luckyColorHex }}
                            />
                        </div>

                        <div className="bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.1)] p-6 sm:p-8 rounded-2xl flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                            <div>
                                <span className="text-[11px] uppercase font-semibold tracking-[0.15em] text-[#5f5e5e] block mb-1">
                                    LUCKY DAY
                                </span>
                                <span className="font-['Playfair_Display',Georgia,serif] text-2xl sm:text-3xl font-semibold text-[#1a1a1a]">
                                    {luckyDay}
                                </span>
                            </div>
                            <Calendar size={32} className="text-[#837560] opacity-20" />
                        </div>
                    </div>

                    {/* Love Card */}
                    <div className="md:col-span-4 bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.1)] p-6 sm:p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3 mb-4">
                            <Heart size={20} className="text-[#ba1a1a]" />
                            <h3 className="font-['Playfair_Display',Georgia,serif] text-2xl font-semibold text-[#1a1a1a]">
                                Love
                            </h3>
                        </div>
                        <p className="text-sm sm:text-base text-[#514532] leading-relaxed">
                            {loveReading}
                        </p>
                    </div>

                    {/* Career Card */}
                    <div className="md:col-span-4 bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.1)] p-6 sm:p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3 mb-4">
                            <Briefcase size={20} className="text-[#7c5800]" />
                            <h3 className="font-['Playfair_Display',Georgia,serif] text-2xl font-semibold text-[#1a1a1a]">
                                Career
                            </h3>
                        </div>
                        <p className="text-sm sm:text-base text-[#514532] leading-relaxed">
                            {careerReading}
                        </p>
                    </div>

                    {/* Finance Card */}
                    <div className="md:col-span-4 bg-[#fdfcf9]/80 backdrop-blur-xl border border-[rgba(26,26,26,0.1)] p-6 sm:p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3 mb-4">
                            <Wallet size={20} className="text-[#7c5800]" />
                            <h3 className="font-['Playfair_Display',Georgia,serif] text-2xl font-semibold text-[#1a1a1a]">
                                Finance
                            </h3>
                        </div>
                        <p className="text-sm sm:text-base text-[#514532] leading-relaxed">
                            {financeReading}
                        </p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#fbf9f8] w-full border-t border-[rgba(26,26,26,0.1)] py-14 sm:py-16 mt-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-[1440px] mx-auto px-6 md:px-16 lg:px-24">
                    <div className="md:col-span-1">
                        <span className="font-['Playfair_Display',Georgia,serif] text-2xl font-semibold text-[#7c5800]">
                            AstroAsk
                        </span>
                        <p className="text-sm text-[#5f5e5e] mt-3 opacity-80 leading-relaxed">
                            © 2024 AstroAsk. All rights reserved. The stars incline, they do not bind.
                        </p>
                    </div>
                    <div className="md:col-span-3 flex flex-wrap gap-x-8 gap-y-3 md:justify-end items-start text-sm text-[#5f5e5e]">
                        <a href="#about" className="hover:text-[#7c5800] underline underline-offset-4 transition-colors">
                            About Us
                        </a>
                        <a href="#contact" className="hover:text-[#7c5800] underline underline-offset-4 transition-colors">
                            Contact
                        </a>
                        <a href="#terms" className="hover:text-[#7c5800] underline underline-offset-4 transition-colors">
                            Terms of Service
                        </a>
                        <a href="#privacy" className="hover:text-[#7c5800] underline underline-offset-4 transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#social" className="hover:text-[#7c5800] underline underline-offset-4 transition-colors">
                            Social
                        </a>
                        <a href="#careers" className="hover:text-[#7c5800] underline underline-offset-4 transition-colors">
                            Careers
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Horoscope;
