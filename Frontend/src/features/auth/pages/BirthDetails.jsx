import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, ChevronRight, ChevronLeft, Globe } from "lucide-react";
import useAuth from "../hooks/useAuth";

// ─── Language Toggle ──────────────────────────────────────────
const LangToggle = ({ isHindi, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={isHindi}
    aria-label={`Switch to ${isHindi ? "English" : "Hindi"}`}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: "none",
      border: "0.5px solid rgba(26,26,26,0.2)",
      borderRadius: "20px",
      padding: "4px 10px",
      cursor: "pointer",
      fontFamily: "'Inter', sans-serif",
      fontSize: "11px",
      fontWeight: 600,
      color: "#5f5e5e",
      transition: "border-color 0.2s, color 0.2s",
    }}
  >
    <Globe size={12} />
    {isHindi ? "HI" : "EN"}
  </button>
);

// ─── Cosmic dot background ────────────────────────────────────
const CosmicBg = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      background: "#fbf9f8",
      backgroundImage: `
        radial-gradient(ellipse at 15% 50%, rgba(255,184,0,0.05) 0%, transparent 50%),
        radial-gradient(ellipse at 85% 30%, rgba(124,88,0,0.03) 0%, transparent 40%),
        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a1a1a' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
      `,
    }}
    aria-hidden="true"
  />
);

// ─── Premium Field ────────────────────────────────────────────
const PremiumField = ({ id, label, labelRight, icon: Icon, error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <label
        htmlFor={id}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#1a1a1a",
        }}
      >
        {label}
      </label>
      {labelRight && (
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#5f5e5e",
            opacity: 0.6,
          }}
        >
          {labelRight}
        </span>
      )}
    </div>
    <div style={{ position: "relative" }}>
      {children}
      <div className="input-glow-line" />
      {Icon && (
        <Icon
          size={15}
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#5f5e5e",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
    {error && (
      <p
        role="alert"
        style={{
          fontSize: "11px",
          color: "#ba1a1a",
          fontFamily: "'Inter', sans-serif",
          margin: 0,
        }}
      >
        {error}
      </p>
    )}
  </div>
);

// ─── Birth Details Page ───────────────────────────────────────
const BirthDetails = () => {
  const navigate = useNavigate();
  const { handleUpdateProfile, profileLoading, error, clearError, isAuthenticated } = useAuth();

  const [isHindi, setIsHindi] = useState(false);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    dob: "",
    tob: "",
    pob: "",
  });

  useEffect(() => {
    return () => clearError();
  }, []);

  // If not authenticated, redirect to register
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/register", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.dob) errs.dob = "Date of birth is required.";
    else {
      const dob = new Date(form.dob);
      if (dob > new Date()) errs.dob = "Date cannot be in the future.";
    }
    if (!timeUnknown && !form.tob) errs.tob = "Time is required (or mark unknown).";
    if (!form.pob.trim()) errs.pob = "Place of birth is required.";
    else if (form.pob.trim().length < 2) errs.pob = "Enter a valid location.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    const payload = {
      birthDate: form.dob,
      birthTime: timeUnknown ? null : form.tob,
      birthPlace: form.pob.trim(),
      language: isHindi ? "hi" : "en",
    };
    await handleUpdateProfile(payload);
    navigate("/subscription");
  };

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: "#fbf9f8",
      }}
    >
      <CosmicBg />

      {/* ── Compact Header ── */}
      <header
        style={{
          position: "relative",
          zIndex: 10,
          padding: "clamp(12px, 2vh, 18px) clamp(20px, 4vw, 60px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(18px, 2.5vw, 24px)",
            fontWeight: 600,
            color: "#7c5800",
            letterSpacing: "-0.02em",
          }}
        >
          AstroAsk
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#5f5e5e",
            }}
          >
            Language
          </span>
          <LangToggle isHindi={isHindi} onToggle={() => setIsHindi((v) => !v)} />
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 clamp(16px, 3vw, 40px) clamp(12px, 2vh, 24px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="glass-panel"
          style={{
            width: "100%",
            maxWidth: "540px",
            borderRadius: "12px",
            padding: "clamp(18px, 3vh, 32px) clamp(20px, 3vw, 44px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Gold top line */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, #ffb800, transparent)",
              opacity: 0.5,
            }}
          />

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "clamp(12px, 2vh, 20px)" }}>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#5f5e5e",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Step 02 — Registration
            </span>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(22px, 3.5vh, 34px)",
                fontWeight: 700,
                color: "#1a1a1a",
                lineHeight: 1.15,
                margin: "0 0 6px",
              }}
            >
              Birth Details
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                color: "#5f5e5e",
                lineHeight: 1.5,
                maxWidth: "400px",
                margin: "0 auto",
              }}
            >
              Precise astronomical calculations require exact temporal and spatial coordinates.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              style={{
                background: "#ffdad6",
                border: "1px solid rgba(186,26,26,0.2)",
                borderRadius: "6px",
                padding: "8px 12px",
                marginBottom: "12px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "12px",
                color: "#93000a",
              }}
            >
              {typeof error === "string" ? error : "Something went wrong. Please try again."}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ display: "flex", flexDirection: "column", gap: "clamp(10px, 1.8vh, 16px)" }}
          >
            {/* DOB */}
            <PremiumField id="dob" label="Date of Birth" icon={Calendar} error={fieldErrors.dob}>
              <input
                id="dob"
                type="date"
                value={form.dob}
                onChange={handleChange("dob")}
                required
                className="premium-input"
                style={{ padding: "6px 0", paddingRight: "26px", fontSize: "14px" }}
                max={new Date().toISOString().split("T")[0]}
                aria-invalid={!!fieldErrors.dob}
              />
            </PremiumField>

            {/* Time Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                alignItems: "end",
              }}
            >
              <PremiumField
                id="tob"
                label="Time of Birth"
                labelRight="24H"
                icon={Clock}
                error={fieldErrors.tob}
              >
                <input
                  id="tob"
                  type="time"
                  value={form.tob}
                  onChange={handleChange("tob")}
                  disabled={timeUnknown}
                  className="premium-input"
                  style={{
                    padding: "6px 0",
                    paddingRight: "26px",
                    fontSize: "14px",
                    opacity: timeUnknown ? 0.4 : 1,
                  }}
                  aria-invalid={!!fieldErrors.tob}
                />
              </PremiumField>

              {/* Time Unknown */}
              <div style={{ paddingBottom: "6px" }}>
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={timeUnknown}
                    onChange={(e) => {
                      setTimeUnknown(e.target.checked);
                      if (e.target.checked) {
                        setForm((p) => ({ ...p, tob: "" }));
                        setFieldErrors((p) => ({ ...p, tob: "" }));
                      }
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13px",
                      color: "#5f5e5e",
                    }}
                  >
                    Time unknown
                  </span>
                </label>
              </div>
            </div>

            {/* POB */}
            <PremiumField id="pob" label="Place of Birth" icon={MapPin} error={fieldErrors.pob}>
              <input
                id="pob"
                type="text"
                placeholder="City, State, Country"
                value={form.pob}
                onChange={handleChange("pob")}
                required
                className="premium-input"
                style={{ padding: "6px 0", paddingRight: "26px", fontSize: "14px" }}
                aria-invalid={!!fieldErrors.pob}
              />
            </PremiumField>

            {/* Actions */}
            <div
              style={{
                paddingTop: "clamp(8px, 1.5vh, 14px)",
                borderTop: "0.5px solid rgba(26,26,26,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-text"
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 0", fontSize: "11px" }}
              >
                <ChevronLeft size={13} />
                Back
              </button>

              <button
                type="submit"
                disabled={profileLoading}
                className="btn-gold"
                style={{ padding: "13px 28px" }}
                aria-busy={profileLoading}
              >
                {profileLoading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: "14px",
                        height: "14px",
                        border: "2px solid rgba(26,26,26,0.3)",
                        borderTopColor: "#1a1a1a",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Chart</span>
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default BirthDetails;