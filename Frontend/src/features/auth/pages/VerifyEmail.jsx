import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, RefreshCw, Mail, ChevronLeft } from "lucide-react";
import useAuth from "../hooks/useAuth";

// ─── Atmospheric background ───────────────────────────────────
const AtmosphericBg = () => (
  <div
    style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}
    aria-hidden="true"
  >
    <div
      style={{
        position: "absolute",
        top: "-15%",
        left: "-10%",
        width: "55%",
        height: "55%",
        background: "radial-gradient(circle, rgba(213,196,171,0.22) 0%, transparent 70%)",
        filter: "blur(80px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: "-15%",
        right: "-10%",
        width: "60%",
        height: "60%",
        background: "radial-gradient(circle, rgba(228,226,226,0.28) 0%, transparent 70%)",
        filter: "blur(100px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a1a1a' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  </div>
);

// ─── Individual OTP digit box ─────────────────────────────────
const OtpBox = ({ value, onChange, onKeyDown, onPaste, inputRef, index, hasError }) => (
  <input
    ref={inputRef}
    id={`otp-digit-${index}`}
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    maxLength={1}
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    onPaste={onPaste}
    aria-label={`OTP digit ${index + 1}`}
    autoComplete="one-time-code"
    style={{
      width: "clamp(38px, 9vw, 50px)",
      height: "clamp(46px, 10vw, 58px)",
      textAlign: "center",
      fontSize: "clamp(18px, 3.5vw, 24px)",
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 700,
      color: "#1a1a1a",
      background: "transparent",
      border: "none",
      borderBottom: hasError
        ? "2px solid #ba1a1a"
        : value
        ? "2px solid #ffb800"
        : "1.5px solid rgba(26,26,26,0.2)",
      borderRadius: 0,
      outline: "none",
      transition: "border-color 0.25s ease, transform 0.15s ease",
      caretColor: "#ffb800",
      transform: value ? "scale(1.04)" : "scale(1)",
    }}
    onFocus={(e) => {
      e.target.style.borderBottomColor = "#ffb800";
      e.target.style.boxShadow = "0 2px 0 0 rgba(255,184,0,0.35)";
    }}
    onBlur={(e) => {
      e.target.style.borderBottomColor = hasError
        ? "#ba1a1a"
        : value
        ? "#ffb800"
        : "rgba(26,26,26,0.2)";
      e.target.style.boxShadow = "none";
    }}
  />
);

// ─── Countdown timer hook ─────────────────────────────────────
const useCountdown = (initialSeconds = 60) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [active, setActive]   = useState(true);

  useEffect(() => {
    if (!active) return;
    if (seconds <= 0) { setActive(false); return; }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds, active]);

  const restart = () => { setSeconds(initialSeconds); setActive(true); };
  return { seconds, canResend: !active, restart };
};

// ─── VerifyEmail page ─────────────────────────────────────────
const VerifyEmail = () => {
  const navigate = useNavigate();
  const {
    handleVerifyEmail,
    handleResendOtp,
    otpLoading,
    error,
    pendingEmail,
    clearError,
  } = useAuth();

  const OTP_LENGTH = 6;
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [fieldError, setFieldError] = useState("");
  const inputRefs = useRef([]);
  const { seconds, canResend, restart } = useCountdown(60);

  // Guard: if no pendingEmail, send back to register
  useEffect(() => {
    if (!pendingEmail) navigate("/register", { replace: true });
  }, [pendingEmail, navigate]);

  useEffect(() => () => clearError(), []);

  // Auto-submit validation
  useEffect(() => {
    if (digits.every((d) => d !== "")) {
      setFieldError("");
    }
  }, [digits]);

  const focusAt = (i) => inputRefs.current[i]?.focus();

  const handleDigitChange = (index) => (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = val;
    setDigits(next);
    setFieldError("");
    if (val && index < OTP_LENGTH - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index) => (e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
        focusAt(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusAt(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusAt(index + 1);
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const lastIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    focusAt(lastIdx);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      setFieldError("Please enter all 6 digits.");
      return;
    }
    await handleVerifyEmail({ otp });
  };

  const handleResend = async () => {
    if (!canResend) return;
    await handleResendOtp();
    restart();
    setDigits(Array(OTP_LENGTH).fill(""));
    focusAt(0);
  };

  const allFilled = digits.every((d) => d !== "");

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: "#fbf9f8",
      }}
    >
      <AtmosphericBg />

      <main
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="glass-panel"
          style={{
            width: "100%",
            maxWidth: "460px",
            borderRadius: "12px",
            padding: "clamp(20px, 3vh, 32px) clamp(20px, 3vw, 40px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top gold accent */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1.5px",
              background: "linear-gradient(90deg, transparent 0%, #ffb800 50%, transparent 100%)",
              opacity: 0.5,
            }}
          />

          {/* Step indicator */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "clamp(12px, 2vh, 20px)",
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
              }}
            >
              Step 1.5 of 3
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    height: "1.5px",
                    width: i === 0 ? "32px" : "24px",
                    background: i === 0 ? "#1a1a1a" : "rgba(26,26,26,0.15)",
                    borderRadius: "1px",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Header */}
          <div style={{ marginBottom: "clamp(14px, 2.5vh, 24px)" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "rgba(255,184,0,0.12)",
                border: "1px solid rgba(255,184,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
              }}
              aria-hidden="true"
            >
              <Mail size={18} style={{ color: "#7c5800" }} />
            </div>

            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(22px, 3.5vh, 32px)",
                fontWeight: 700,
                color: "#1a1a1a",
                lineHeight: 1.2,
                margin: "0 0 8px",
              }}
            >
              Verify Your Email
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                color: "#514532",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              We sent a 6-digit code to{" "}
              <strong style={{ color: "#1a1a1a", fontWeight: 600 }}>
                {pendingEmail || "your email"}
              </strong>
            </p>
          </div>

          {/* API Error */}
          {error && (
            <div
              role="alert"
              style={{
                background: "#ffdad6",
                border: "1px solid rgba(186,26,26,0.2)",
                borderRadius: "6px",
                padding: "8px 12px",
                marginBottom: "14px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "12px",
                color: "#93000a",
              }}
            >
              {typeof error === "string" ? error : "Invalid OTP. Please try again."}
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* OTP Boxes */}
            <div
              style={{
                display: "flex",
                gap: "clamp(6px, 1.5vw, 12px)",
                justifyContent: "center",
                marginBottom: "10px",
              }}
              role="group"
              aria-label="One-time password input"
            >
              {digits.map((digit, i) => (
                <OtpBox
                  key={i}
                  index={i}
                  value={digit}
                  hasError={!!fieldError}
                  inputRef={(el) => (inputRefs.current[i] = el)}
                  onChange={handleDigitChange(i)}
                  onKeyDown={handleKeyDown(i)}
                  onPaste={handlePaste}
                />
              ))}
            </div>

            {/* Field error */}
            {fieldError && (
              <p
                role="alert"
                style={{
                  textAlign: "center",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  color: "#ba1a1a",
                  marginBottom: "8px",
                }}
              >
                {fieldError}
              </p>
            )}

            {/* Divider below boxes */}
            <div
              style={{
                height: "1px",
                background: "rgba(26,26,26,0.07)",
                margin: "clamp(12px, 2vh, 18px) 0",
              }}
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={otpLoading || !allFilled}
              className="btn-gold"
              style={{ width: "100%", padding: "13px 24px", marginBottom: "14px" }}
              aria-busy={otpLoading}
            >
              {otpLoading ? (
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
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify & Continue</span>
                  <ArrowRight size={14} strokeWidth={2.5} />
                </>
              )}
            </button>

            {/* Resend + Back row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="btn-text"
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 0", fontSize: "11px" }}
              >
                <ChevronLeft size={13} />
                Back
              </button>

              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  color: "#5f5e5e",
                }}
              >
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#7c5800",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: 0,
                    }}
                  >
                    <RefreshCw size={12} />
                    Resend Code
                  </button>
                ) : (
                  <span>
                    Resend in{" "}
                    <span style={{ fontWeight: 600, color: "#1a1a1a" }}>
                      {seconds}s
                    </span>
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default VerifyEmail;
