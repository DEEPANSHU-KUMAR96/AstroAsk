import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Star } from "lucide-react";
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
    <label htmlFor={id} style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#5f5e5e", marginBottom: "5px" }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <input
        id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
        className="premium-input"
        style={{ paddingRight: children ? "36px" : "0", padding: "7px 0", fontSize: "15px" }}
        aria-describedby={error ? `${id}-error` : undefined} aria-invalid={!!error}
      />
      <div className="input-glow-line" />
      {children}
    </div>
    {error && <p id={`${id}-error`} role="alert" style={{ marginTop: "4px", fontSize: "11px", color: "#ba1a1a", fontFamily: "'Inter', sans-serif" }}>{error}</p>}
  </div>
);

const Login = () => {
  const { handleLogin, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => () => clearError(), []);

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    await handleLogin({ email: form.email.trim().toLowerCase(), password: form.password });
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", background: "#fbf9f8" }}>
      <AtmosphericBg />
      <div className="glass-panel" style={{ width: "100%", maxWidth: "440px", borderRadius: "12px", padding: "clamp(20px, 3.5vh, 36px) clamp(24px, 3vw, 44px)", position: "relative", overflow: "hidden", zIndex: 1, margin: "0 16px" }}>

        {/* Gold top line */}
        <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1.5px", background: "linear-gradient(90deg, transparent, #ffb800, transparent)", opacity: 0.5 }} />

        {/* Header */}
        <div style={{ marginBottom: "clamp(16px, 2.8vh, 26px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Star size={15} style={{ color: "#ffb800", fill: "#ffb800", flexShrink: 0 }} aria-hidden="true" />
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(24px, 3.8vh, 36px)", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.15, margin: 0 }}>Welcome Back</h1>
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", lineHeight: 1.55, color: "#514532", margin: 0 }}>Sign in to continue your cosmic journey and view your alignments.</p>
        </div>

        {/* Error */}
        {error && (
          <div role="alert" style={{ background: "#ffdad6", border: "1px solid rgba(186,26,26,0.2)", borderRadius: "6px", padding: "8px 12px", marginBottom: "14px", fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#93000a" }}>
            {typeof error === "string" ? error : "Login failed. Please try again."}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 2vh, 18px)" }}>
          <PremiumField id="login-email" label="Email Address" type="email" placeholder="eleanor@example.com" value={form.email} onChange={handleChange("email")} required error={fieldErrors.email} />
          <PremiumField id="login-password" label="Password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={form.password} onChange={handleChange("password")} required error={fieldErrors.password}>
            <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}
              style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5f5e5e", padding: "4px", display: "flex", alignItems: "center" }}
              onMouseEnter={e => e.currentTarget.style.color = "#7c5800"} onMouseLeave={e => e.currentTarget.style.color = "#5f5e5e"}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </PremiumField>

          <div style={{ paddingTop: "clamp(4px, 1vh, 8px)" }}>
            <button type="submit" disabled={loading} className="btn-gold" style={{ width: "100%", padding: "13px 24px" }} aria-busy={loading}>
              {loading ? (
                <><span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(26,26,26,0.3)", borderTopColor: "#1a1a1a", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /><span>Signing In...</span></>
              ) : (
                <><span>Sign In</span><ArrowRight size={14} strokeWidth={2.5} /></>
              )}
            </button>
          </div>
        </form>

        <p style={{ marginTop: "clamp(12px, 1.8vh, 18px)", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#5f5e5e" }}>
          New to AstroAsk?{" "}
          <Link to="/register" style={{ color: "#7c5800", textDecoration: "underline", textUnderlineOffset: "3px", fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.color = "#ffb800"} onMouseLeave={e => e.currentTarget.style.color = "#7c5800"}>
            Create Account
          </Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;