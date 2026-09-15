import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, LogOut, Menu, X } from "lucide-react";
import useAuth from "../../features/auth/hooks/useAuth";

const Navbar = ({ lang: propLang, onLangChange, onOpenChatSidebar }) => {
  const { user, isAuthenticated, handleLogout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync language with fallback to localStorage
  const [localLang, setLocalLang] = useState(() => localStorage.getItem("astro_lang") || "en");
  const currentLang = propLang || localLang;

  const handleLangSelect = (l) => {
    setLocalLang(l);
    localStorage.setItem("astro_lang", l);
    if (onLangChange) onLangChange(l);
  };

  const isHoroscope = location.pathname === "/" || location.pathname.startsWith("/horoscope");
  const isKundli = location.pathname.startsWith("/kundli");
  const isChat = location.pathname.startsWith("/chat");
  const isTarot = location.pathname.startsWith("/tarot");

  const navLinks = [
    { to: "/horoscope", label: "Horoscopes", active: isHoroscope },
    { to: "/kundli", label: "Kundli", active: isKundli },
    { to: "/chat", label: "Live Chat", active: isChat },
    { to: "/tarot", label: "Tarot", active: isTarot },
  ];

  return (
    <nav className="bg-[#fdfcf9]/92 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-[rgba(26,26,26,0.08)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-3.5 md:py-4">

        {/* Brand Logo (+ Mobile Chat Sidebar Button) */}
        <div className="flex items-center gap-2">
          {isChat && onOpenChatSidebar && (
            <button
              onClick={onOpenChatSidebar}
              className="md:hidden p-1.5 rounded-lg text-[#7c5800] hover:bg-[#f4ece1] transition-colors cursor-pointer"
              aria-label="Open chat consultations"
              title="Chat History"
            >
              <Menu size={18} />
            </button>
          )}
          <Link
            to="/horoscope"
            className="font-['Playfair_Display',Georgia,serif] text-xl sm:text-2xl md:text-[26px] font-bold text-[#7c5800] tracking-tight hover:opacity-90 transition-opacity"
          >
            AstroAsk
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] font-semibold uppercase tracking-[0.15em]">
          {navLinks.map(({ to, label, active }) => (
            <Link
              key={label}
              to={to}
              className={`pb-1 transition-all ${active
                ? "text-[#7c5800] border-b-2 border-[#ffb800] font-bold"
                : "text-[#5f5e5e] hover:text-[#7c5800]"
                }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right Area: Language Toggle + Auth + Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hindi / English Toggle Pill */}
          <div className="flex items-center bg-[#f0ede8] rounded-full p-[3px] border border-[rgba(26,26,26,0.1)] shrink-0">
            {["en", "hi"].map((l) => (
              <button
                key={l}
                id={`navbar-lang-toggle-${l}`}
                type="button"
                onClick={() => handleLangSelect(l)}
                className={`px-2.5 sm:px-3 py-[3px] text-[11px] font-bold rounded-full transition-all duration-150 cursor-pointer ${currentLang === l
                    ? "bg-white text-[#7c5800] shadow-sm"
                    : "text-[#5f5e5e] hover:text-[#7c5800]"
                  }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Auth */}
          <div className="flex gap-2 sm:gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] items-center">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 text-[#5f5e5e] normal-case tracking-normal bg-[#f4ece1]/60 px-2.5 sm:px-3 py-1.5 rounded-full border border-[rgba(124,88,0,0.15)]">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || "User"}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-[#ffb800]/50 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#ffb800]/25 border border-[#ffb800]/40 flex items-center justify-center flex-shrink-0">
                      <User size={12} className="text-[#7c5800]" />
                    </div>
                  )}
                  <span className="text-[#1a1a1a] font-medium text-xs max-w-[80px] sm:max-w-[130px] truncate hidden xs:block">
                    {user.name || user.email}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-[#5f5e5e] hover:text-[#ba1a1a] p-2 rounded-lg transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="text-[#5f5e5e] hover:text-[#7c5800] px-2 sm:px-3 py-1.5 transition-colors text-[11px]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-[#ffb800] text-[#6b4c00] px-3 sm:px-5 py-1.5 sm:py-2 rounded-full hover:bg-[#ffba20] transition-all shadow-sm font-bold active:scale-95 text-[11px]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-[#7c5800] hover:bg-[#f4ece1] transition-colors cursor-pointer"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(26,26,26,0.08)] bg-[#fdfcf9] px-4 py-4 flex flex-col gap-2 animate-fade-in-up">
          <div className="flex items-center justify-between px-3 py-1 mb-1 border-b border-[rgba(26,26,26,0.06)] pb-2">
            <span className="text-xs font-semibold text-[#5f5e5e]">Language</span>
            <div className="flex items-center bg-[#f0ede8] rounded-full p-[2px] border border-[rgba(26,26,26,0.1)]">
              {["en", "hi"].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => handleLangSelect(l)}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${currentLang === l ? "bg-white text-[#7c5800] shadow-sm" : "text-[#5f5e5e]"
                    }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {navLinks.map(({ to, label, active }) => (
            <Link
              key={label}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-semibold px-3 py-2.5 rounded-xl transition-all ${active
                ? "bg-[#fff9ed] text-[#7c5800] border-l-2 border-[#ffb800]"
                : "text-[#5f5e5e] hover:text-[#7c5800] hover:bg-[#f4ece1]/50"
                }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
