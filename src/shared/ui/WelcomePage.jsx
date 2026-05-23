import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";

/* ── decode JWT payload (no library needed) ── */
function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/* ── resolve the email from sessionStorage refreshToken JWT ── */
function resolveEmail() {
  // Primary: sessionStorage refreshToken (Spring Security sets sub = email)
  const token = sessionStorage.getItem("refreshToken");
  if (token) {
    const payload = parseJwt(token);
    const email = payload?.sub || payload?.email || payload?.username;
    if (email && email.includes("@")) return email;
  }

  // Fallback: scan all sessionStorage keys for any JWT containing an email
  for (const key of Object.keys(sessionStorage)) {
    const val = sessionStorage.getItem(key);
    if (!val || !val.startsWith("ey")) continue;
    const payload = parseJwt(val);
    const email = payload?.sub || payload?.email || payload?.username;
    if (email && email.includes("@")) return email;
  }

  // Last resort: localStorage direct email keys
  for (const key of ["email", "userEmail", "user_email"]) {
    const val = localStorage.getItem(key);
    if (val && val.includes("@")) return val;
  }

  return "";
}

/* ── turn "john.doe@company.com" → "John Doe" ── */
function emailToName(email) {
  if (!email) return "User";
  return email
    .split("@")[0]
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function WelcomePage({ onDone }) {
  const navigate = useNavigate();

  const email    = resolveEmail();
  const username = emailToName(email);

  useEffect(() => {
    console.log("EMAIL =", email, "| NAME =", username);

    const timer = setTimeout(() => {
      if (onDone) {
        onDone();
      } else {
        navigate("/dashboard");
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [onDone, navigate, email, username]);

  return (
    <div className="page-wrapper">
      <section className="hero">

        {/* TOP CURVES */}
        <svg
          className="curve-svg top-svg"
          viewBox="0 0 1200 260"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="neon-flow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#062c2f" stopOpacity="0.15" />
              <stop offset="35%"  stopColor="#0a8f91" stopOpacity="0.55" />
              <stop offset="50%"  stopColor="#62ffff" stopOpacity="1"    />
              <stop offset="65%"  stopColor="#0a8f91" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#062c2f" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          <path
            className="neon-curve"
            d="M 0 45  Q 600 250 1200 45"
            stroke="url(#neon-flow)"
            strokeWidth="5"
            fill="none"
          />
          <path
            className="neon-curve secondary"
            d="M 0 70  Q 600 230 1200 70"
            stroke="url(#neon-flow)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        {/* BOTTOM CURVES */}
        <svg
          className="curve-svg bottom-svg"
          viewBox="0 0 1200 260"
          preserveAspectRatio="none"
        >
          <path
            className="neon-curve"
            d="M 0 215 Q 600 10 1200 215"
            stroke="url(#neon-flow)"
            strokeWidth="5"
            fill="none"
          />
          <path
            className="neon-curve secondary"
            d="M 0 190 Q 600 30 1200 190"
            stroke="url(#neon-flow)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        {/* SIDE LINES */}
        <svg className="side-line left-top" viewBox="0 0 600 220" preserveAspectRatio="none">
          <path d="M 0 40 Q 420 130 600 110" stroke="url(#neon-flow)" strokeWidth="2" fill="none" className="thin-line" />
        </svg>
        <svg className="side-line left-bottom" viewBox="0 0 600 220" preserveAspectRatio="none">
          <path d="M 0 180 Q 420 90 600 110" stroke="url(#neon-flow)" strokeWidth="2" fill="none" className="thin-line" />
        </svg>
        <svg className="side-line right-top" viewBox="0 0 600 220" preserveAspectRatio="none">
          <path d="M 0 110 Q 180 130 600 40" stroke="url(#neon-flow)" strokeWidth="2" fill="none" className="thin-line" />
        </svg>
        <svg className="side-line right-bottom" viewBox="0 0 600 220" preserveAspectRatio="none">
          <path d="M 0 110 Q 180 90 600 180" stroke="url(#neon-flow)" strokeWidth="2" fill="none" className="thin-line" />
        </svg>

        {/* CENTER GLOW */}
        <div className="center-glow" />

        {/* CONTENT */}
        <div className="hero-content">
          <div className="glass-card">
            <h1>WELCOME {username}</h1>
            <p>WORKFLOW AD</p>
          </div>
        </div>

      </section>
    </div>
  );
}