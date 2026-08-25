import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Star } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import useAuth from "../hooks/useAuth";

const AtmosphericBg = () => (
  <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }} aria-hidden="true">
    <div style={{ position: "absolute", top: "-15%", left: "-10%", width: "55%", height: "55%", background: "radial-gradient(circle, rgba(213,196,171,0.22) 0%, transparent 70%)", filter: "blur(80px)" }} />
    <div style={{ position: "absolute", bottom: "-15%", right: "-10%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(228,226,226,0.28) 0%, transparent 70%)", filter: "blur(100px)" }} />
    <div style={{ position: "absolute", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a1a1a' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
  </div>
);

const PremiumField = ({ id, label, type = "text", placeholder, value, onChange, required, error, children }) => (
  <div style={{ position: "relative" }}>
    <label htmlFor={id} style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#5f5e5e", marginBottom: "4px" }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <input
        id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
        className="premium-input"
        style={{ paddingRight: children ? "36px" : "0", padding: "6px 0", fontSize: "14px" }}
        aria-describedby={error ? `${id}-error` : undefined} aria-invalid={!!error}
      />
      <div className="input-glow-line" />
      {children}
    </div>
    {error && <p id={`${id}-error`} role="alert" style={{ marginTop: "3px", fontSize: "11px", color: "#ba1a1a", fontFamily: "'Inter', sans-serif" }}>{error}</p>}
  </div>
);

const Register = () => {
  const { handleRegister, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => () => clearError(), []);

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Enter your full name (min. 2 chars).";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.password || form.password.length < 8) e.password = "Password must be at least 8 characters.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    await handleRegister({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password });
  };

  const handleGoogleAuth = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", background: "#fbf9f8" }}>
      <AtmosphericBg />
      <div className="glass-panel" style={{ width: "100%", maxWidth: "460px", borderRadius: "12px", padding: "clamp(16px, 2.5vh, 28px) clamp(20px, 2.8vw, 38px)", position: "relative", overflow: "hidden", zIndex: 1, margin: "0 16px" }}>

        {/* Gold top line */}
        <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1.5px", background: "linear-gradient(90deg, transparent, #ffb800, transparent)", opacity: 0.5 }} />

        {/* Step */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "clamp(8px, 1.5vh, 14px)" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7c5800" }}>Step 1 of 3</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {[0, 1, 2].map(i => <div key={i} style={{ height: "1.5px", width: i === 0 ? "32px" : "24px", background: i === 0 ? "#1a1a1a" : "rgba(26,26,26,0.15)", borderRadius: "1px" }} />)}
          </div>
        </div>

        {/* Header */}
        <div style={{ marginBottom: "clamp(10px, 1.8vh, 18px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Star size={14} style={{ color: "#ffb800", fill: "#ffb800", flexShrink: 0 }} aria-hidden="true" />
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(20px, 3vh, 30px)", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.15, margin: 0 }}>Create Account</h1>
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: 1.45, color: "#514532", margin: 0 }}>Begin your celestial journey to construct your astral profile.</p>
        </div>

        {/* Error */}
        {error && (
          <div role="alert" style={{ background: "#ffdad6", border: "1px solid rgba(186,26,26,0.2)", borderRadius: "6px", padding: "6px 10px", marginBottom: "10px", fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#93000a" }}>
            {typeof error === "string" ? error : "Registration failed. Please try again."}
          </div>
        )}

        {/* Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            background: "rgba(255, 255, 255, 0.8)",
            border: "1px solid rgba(26, 26, 26, 0.12)",
            borderRadius: "4px",
            padding: "9px 16px",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            fontWeight: 600,
            color: "#1a1a1a",
            transition: "all 0.2s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 184, 0, 0.6)";
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(26, 26, 26, 0.12)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
          }}
        >
          <FcGoogle size={18} />
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "clamp(8px, 1.4vh, 14px) 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(26,26,26,0.08)" }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5f5e5e", textTransform: "uppercase", letterSpacing: "0.1em" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(26,26,26,0.08)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 1.4vh, 14px)" }}>
          <PremiumField id="reg-name" label="Full Name" placeholder="e.g. Eleanor Vance" value={form.name} onChange={handleChange("name")} required error={fieldErrors.name} />
          <PremiumField id="reg-email" label="Email Address" type="email" placeholder="eleanor@example.com" value={form.email} onChange={handleChange("email")} required error={fieldErrors.email} />
          <PremiumField id="reg-password" label="Password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={handleChange("password")} required error={fieldErrors.password}>
            <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}
              style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5f5e5e", padding: "4px", display: "flex", alignItems: "center" }}
              onMouseEnter={e => e.currentTarget.style.color = "#7c5800"} onMouseLeave={e => e.currentTarget.style.color = "#5f5e5e"}>
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </PremiumField>

          <div style={{ paddingTop: "clamp(2px, 0.6vh, 6px)" }}>
            <button type="submit" disabled={loading} className="btn-gold" style={{ width: "100%", padding: "12px 20px" }} aria-busy={loading}>
              {loading ? (
                <><span style={{ display: "inline-block", width: "13px", height: "13px", border: "2px solid rgba(26,26,26,0.3)", borderTopColor: "#1a1a1a", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /><span>Sending OTP...</span></>
              ) : (
                <><span>Continue to Alignment</span><ArrowRight size={13} strokeWidth={2.5} /></>
              )}
            </button>
          </div>
        </form>

        <p style={{ marginTop: "clamp(8px, 1.2vh, 12px)", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#5f5e5e" }}>
          Already an initiate?{" "}
          <Link to="/login" style={{ color: "#7c5800", textDecoration: "underline", textUnderlineOffset: "3px", fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.color = "#ffb800"} onMouseLeave={e => e.currentTarget.style.color = "#7c5800"}>
            Sign In
          </Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Register;