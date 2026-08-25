import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Star, ArrowLeft, Sparkles, Zap, Crown } from "lucide-react";

// ─── Plan data ────────────────────────────────────────────────
const PLANS = [
  {
    id: "seeker",
    tier: "TIER 1",
    name: "Seeker",
    price: null,
    priceSuffix: null,
    description: "Essential insights to begin your journey.",
    icon: Sparkles,
    recommended: false,
    features: [
      "Daily Horoscopes",
      "Basic Birth Chart",
      "Community Forum Access",
    ],
    cta: "Select Seeker",
  },
  {
    id: "enlightened",
    tier: "TIER 3",
    name: "Enlightened",
    price: "$29",
    priceSuffix: "/mo",
    description: "Unrestricted access to master astrologers & premium tools.",
    icon: Crown,
    recommended: true,
    features: [
      "Everything in Explorer, plus:",
      "Unlimited Live Chat (Master Astrologers)",
      "Priority Booking for 1-on-1 Sessions",
      "Advanced Transit Analysis",
    ],
    cta: "Choose Enlightened",
  },
  {
    id: "explorer",
    tier: "TIER 2",
    name: "Explorer",
    price: "$9",
    priceSuffix: "/mo",
    description: "Expanded tools for deeper self-discovery.",
    icon: Zap,
    recommended: false,
    features: [
      "Everything in Seeker, plus:",
      "Detailed Kundli Matching",
      "Monthly Tarot Reading",
      "Ad-Free Experience",
    ],
    cta: "Select Explorer",
  },
];

// ─── Feature list item ────────────────────────────────────────
const FeatureItem = ({ text, recommended, isFirst }) => (
  <li
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
    }}
  >
    <span
      style={{
        flexShrink: 0,
        marginTop: "2px",
        width: "14px",
        height: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isFirst && recommended ? (
        <Star
          size={12}
          style={{ color: "#ffb800", fill: "#ffb800" }}
          aria-hidden="true"
        />
      ) : (
        <Check
          size={12}
          strokeWidth={2.5}
          style={{ color: "#7c5800" }}
          aria-hidden="true"
        />
      )}
    </span>
    <span
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "12px",
        lineHeight: 1.4,
        color: recommended && isFirst ? "#1a1a1a" : "#5f5e5e",
        fontWeight: recommended && isFirst ? 600 : 400,
      }}
    >
      {text}
    </span>
  </li>
);

// ─── Pricing Card ─────────────────────────────────────────────
const PricingCard = ({ plan, selected, onSelect }) => {
  const { id, tier, name, price, priceSuffix, description, icon: Icon,
          recommended, features, cta } = plan;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Select ${name} plan`}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(id)}
      style={{
        position: "relative",
        background: recommended
          ? "rgba(255,255,255,0.92)"
          : "rgba(253,252,249,0.82)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: selected
          ? "1.5px solid #ffb800"
          : recommended
          ? "1px solid rgba(255,184,0,0.5)"
          : "0.5px solid rgba(26,26,26,0.1)",
        borderRadius: "12px",
        padding: "clamp(14px, 2vh, 22px) clamp(14px, 1.8vw, 24px)",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "all 0.25s ease",
        transform: recommended ? "scale(1.02)" : "scale(1)",
        boxShadow: selected
          ? "0 16px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,184,0,0.2)"
          : recommended
          ? "0 12px 28px rgba(0,0,0,0.05)"
          : "0 4px 16px rgba(0,0,0,0.03)",
        outline: "none",
      }}
    >
      {/* Recommended badge */}
      {recommended && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: "14px",
            background: "#ffb800",
            color: "#1a1a1a",
            fontFamily: "'Inter', sans-serif",
            fontSize: "8px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: "0 0 6px 6px",
          }}
        >
          Recommended
        </div>
      )}

      {/* Top gold line */}
      {recommended && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, transparent 0%, #ffb800 50%, transparent 100%)",
            borderRadius: "12px 12px 0 0",
            opacity: 0.7,
          }}
        />
      )}

      {/* Card Header */}
      <div style={{ marginBottom: "12px", paddingTop: recommended ? "4px" : "0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: recommended ? "#7c5800" : "#5f5e5e",
            }}
          >
            {tier}
          </span>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: recommended
                ? "rgba(255,184,0,0.12)"
                : "rgba(26,26,26,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-hidden="true"
          >
            <Icon
              size={12}
              style={{
                color: recommended ? "#7c5800" : "#5f5e5e",
                fill: recommended ? "rgba(124,88,0,0.15)" : "none",
              }}
            />
          </div>
        </div>

        {/* Plan Name */}
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(18px, 2.2vh, 24px)",
            fontWeight: 700,
            margin: "0 0 4px",
            ...(recommended
              ? {
                  background: "linear-gradient(135deg, #7c5800 0%, #ffb800 55%, #7c5800 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }
              : { color: "#1a1a1a" }),
          }}
        >
          {name}
        </h2>

        {/* Price */}
        <div
          style={{ display: "flex", alignItems: "baseline", gap: "3px", marginBottom: "4px" }}
        >
          {price ? (
            <>
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(24px, 3vh, 30px)",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  lineHeight: 1,
                }}
              >
                {price}
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  color: "#5f5e5e",
                }}
              >
                {priceSuffix}
              </span>
            </>
          ) : (
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(24px, 3vh, 30px)",
                fontWeight: 700,
                color: "#1a1a1a",
                lineHeight: 1,
              }}
            >
              Free
            </span>
          )}
        </div>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            lineHeight: 1.45,
            color: "#5e5f5d",
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          background: recommended
            ? "rgba(255,184,0,0.2)"
            : "rgba(26,26,26,0.06)",
          marginBottom: "12px",
        }}
      />

      {/* Features */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flex: 1,
        }}
      >
        {features.map((f, i) => (
          <FeatureItem
            key={i}
            text={f}
            recommended={recommended}
            isFirst={i === 0}
          />
        ))}
      </ul>

      {/* CTA Button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSelect(id); }}
        style={{
          width: "100%",
          padding: "10px 16px",
          borderRadius: "4px",
          fontFamily: "'Inter', sans-serif",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "all 0.25s ease",
          ...(recommended
            ? {
                background: selected ? "#7c5800" : "#ffb800",
                color: selected ? "#ffffff" : "#1a1a1a",
                border: "none",
                boxShadow: "0 4px 12px rgba(255,184,0,0.25)",
              }
            : {
                background: selected ? "rgba(26,26,26,0.06)" : "transparent",
                color: "#1a1a1a",
                border: "1px solid rgba(26,26,26,0.15)",
              }),
        }}
      >
        {selected ? "✓ " : ""}{cta}
      </button>
    </div>
  );
};

// ─── Subscription Page ────────────────────────────────────────
const Subscription = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("enlightened");

  const handleContinue = () => {
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "#fbf9f8",
        position: "relative",
      }}
    >
      {/* ── Background accents ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: `
            radial-gradient(ellipse at 85% 10%, rgba(255,184,0,0.1) 0%, transparent 45%),
            radial-gradient(ellipse at 10% 90%, rgba(124,88,0,0.06) 0%, transparent 40%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a1a1a' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
          `,
        }}
      />

      {/* ── Top indicator ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "rgba(26,26,26,0.08)",
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            background: "#ffb800",
          }}
        />
      </div>

      {/* ── Compact Header ── */}
      <header
        style={{
          position: "relative",
          zIndex: 10,
          padding: "clamp(8px, 1.5vh, 14px) 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(18px, 2.2vh, 24px)",
            fontWeight: 600,
            color: "#7c5800",
            letterSpacing: "-0.02em",
          }}
        >
          AstroAsk
        </span>
      </header>

      {/* ── Main Area ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 clamp(14px, 3vw, 40px) clamp(10px, 1.5vh, 16px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Title */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "clamp(10px, 1.8vh, 18px)",
            maxWidth: "560px",
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#7c5800",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Step 3 of 3 — Final Step
          </span>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(22px, 3.5vh, 34px)",
              fontWeight: 700,
              color: "#1a1a1a",
              lineHeight: 1.15,
              margin: "0 0 4px",
            }}
          >
            Choose Your Path
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              lineHeight: 1.45,
              color: "#5f5e5e",
              margin: 0,
            }}
          >
            Select a membership level to unlock deeper celestial insights.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "clamp(10px, 1.5vw, 18px)",
            width: "100%",
            maxWidth: "920px",
            alignItems: "stretch",
            marginBottom: "clamp(12px, 2vh, 18px)",
          }}
          className="subscription-grid"
        >
          <style>{`
            @media (max-width: 680px) {
              .subscription-grid {
                grid-template-columns: 1fr !important;
                max-height: 55vh;
                overflow-y: auto;
              }
            }
          `}</style>

          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              selected={selected === plan.id}
              onSelect={setSelected}
            />
          ))}
        </div>

        {/* Continue Button + Return */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {selected && (
            <button
              type="button"
              onClick={handleContinue}
              className="btn-gold"
              style={{
                minWidth: "220px",
                padding: "11px 24px",
                fontSize: "10px",
              }}
            >
              Continue with {PLANS.find((p) => p.id === selected)?.name}
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-text"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              fontSize: "10px",
            }}
          >
            <ArrowLeft size={11} />
            Return to previous step
          </button>
        </div>
      </main>
    </div>
  );
};

export default Subscription;