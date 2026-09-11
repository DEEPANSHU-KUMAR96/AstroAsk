import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import useAuth from "../../features/auth/hooks/useAuth";

const Navbar = () => {
  const { user, isAuthenticated, handleLogout } = useAuth();
  const location = useLocation();

  const isHoroscope = location.pathname === "/" || location.pathname.startsWith("/horoscope");
  const isKundli = location.pathname.startsWith("/kundli");

  return (
    <nav className="bg-[#fdfcf9]/90 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-[rgba(26,26,26,0.08)] shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-4">
        {/* Brand Logo */}
        <Link
          to="/horoscope"
          className="font-['Playfair_Display',Georgia,serif] text-2xl md:text-3xl font-bold text-[#7c5800] tracking-tight hover:opacity-90 transition-opacity"
        >
          AstroAsk
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.15em]">
          <Link
            to="/horoscope"
            className={`pb-1 transition-all ${isHoroscope
                ? "text-[#7c5800] border-b-2 border-[#7c5800] font-bold"
                : "text-[#5f5e5e] hover:text-[#7c5800]"
              }`}
          >
            Horoscopes
          </Link>

          <Link
            to="/kundli"
            className={`pb-1 transition-all ${isKundli
                ? "text-[#7c5800] border-b-2 border-[#7c5800] font-bold"
                : "text-[#5f5e5e] hover:text-[#7c5800]"
              }`}
          >
            Kundli
          </Link>

          <a
            href="#live-chat"
            className="text-[#5f5e5e] hover:text-[#7c5800] pb-1 transition-colors"
          >
            Live Chat
          </a>

          <a
            href="#tarot"
            className="text-[#5f5e5e] hover:text-[#7c5800] pb-1 transition-colors"
          >
            Tarot
          </a>
        </div>

        {/* Right Auth Area */}
        <div className="flex gap-3 text-xs font-semibold uppercase tracking-[0.12em] items-center">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 text-[#5f5e5e] normal-case tracking-normal bg-[#f4ece1]/60 px-3 py-1.5 rounded-full border border-[rgba(124,88,0,0.15)]">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "User"}
                    className="w-6 h-6 rounded-full object-cover border border-[#ffb800]/50"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#ffb800]/25 border border-[#ffb800]/40 flex items-center justify-center">
                    <User size={13} className="text-[#7c5800]" />
                  </div>
                )}
                <span className="text-[#1a1a1a] font-medium text-xs max-w-[130px] truncate">
                  {user.name || user.email}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-[#5f5e5e] hover:text-[#ba1a1a] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-[#5f5e5e] hover:text-[#7c5800] px-3 py-2 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-[#ffb800] text-[#6b4c00] px-5 py-2 rounded-full hover:bg-[#ffba20] transition-all shadow-sm font-bold active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
