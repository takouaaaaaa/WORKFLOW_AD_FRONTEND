import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Key,
  Mail,
} from "lucide-react";

import { loginUser } from "../services/authService";
import { getUserFromToken, setTokens } from "../utils/auth";
import { ROLES } from "../../app/router/routeConfig";

import "./login.css";

/* ─────────────────────────────────────────
   COLOR RIBBON BACKGROUND
───────────────────────────────────────── */

function ColorRibbon() {
  return (
    <div className="ribbon-page">
      <svg
        className="ribbon-svg"
        viewBox="0 0 740 415"
        preserveAspectRatio="none"
      >
        <path
          className="ribbon ribbon-red"
          d="M-40 250 C 90 160, 150 70, 290 130 C 390 175, 410 250, 535 220 C 630 195, 690 120, 780 155"
        />

        <path
          className="ribbon ribbon-orange"
          d="M-40 265 C 100 190, 160 90, 300 145 C 390 180, 425 245, 540 230 C 650 215, 710 155, 780 180"
        />

        <path
          className="ribbon ribbon-violet"
          d="M-30 240 C 90 140, 170 110, 300 160 C 400 200, 445 280, 565 245 C 650 220, 700 145, 780 165"
        />

        <path
          className="ribbon ribbon-blue"
          d="M-50 280 C 100 225, 190 145, 330 180 C 430 205, 470 300, 590 260 C 665 235, 705 175, 790 210"
        />

        <path
          className="ribbon ribbon-teal"
          d="M-40 300 C 120 245, 215 165, 350 195 C 455 220, 500 315, 610 270 C 680 240, 720 190, 790 225"
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────
   LOGIN PAGE
───────────────────────────────────────── */

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ───────────────────────────────────── */

  const redirectByRole = (user) => {
    if (!user?.roles?.length) {
      setError("No role found for this user");
      return;
    }

    if (user.roles.includes(ROLES.ADMIN)) {
      navigate("/admin");
      return;
    }

    if (user.roles.includes(ROLES.USER_TECHNIQUE)) {
      navigate("/technique");
      return;
    }

    if (user.roles.includes(ROLES.USER_FONCTIONNEL)) {
      navigate("/fonctionnel");
      return;
    }

    setError("Unauthorized role");
  };

  /* ───────────────────────────────────── */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await loginUser({
        email,
        motDePasse,
      });

      setTokens(
        res.data.accessToken,
        res.data.refreshToken
      );

      const user = getUserFromToken();

      redirectByRole(user);
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────────────────────────── */

  return (
    <main className="login-page">
      <ColorRibbon />

      <section className="login-card">
        {/* HEADER */}

        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">
              <Sparkles size={20} />
            </div>

            <div className="logo-text">
              <span className="logo-main">
                WORKFLOW-AD
              </span>

              <span className="logo-sub">
                PLATFORM
              </span>
            </div>
          </div>

          <div className="header-badge">
            <Sparkles size={12} />
            <span>Secure Access</span>
          </div>
        </div>

        {/* TITLE */}

        <div className="welcome-section">
          <h1 className="login-title">
            Welcome back
          </h1>

          <p className="login-subtitle">
            Sign in to continue your journey
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="login-error">
            <Zap size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          {/* EMAIL */}

          <div className="input-group">
            <Mail
              size={18}
              className="input-icon"
            />

            <input
              className="login-input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          {/* PASSWORD */}

          <div className="input-group">
            <Key
              size={18}
              className="input-icon"
            />

            <input
              className="login-input"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={motDePasse}
              onChange={(e) =>
                setMotDePasse(e.target.value)
              }
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {/* BUTTON */}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            <span className="button-text">
              {loading
                ? "Authenticating..."
                : "Sign in"}
            </span>

            {!loading ? (
              <Zap
                size={16}
                className="button-icon"
              />
            ) : (
              <div className="button-spinner"></div>
            )}
          </button>
        </form>

        {/* FOOTER */}

        <div className="login-footer">
          <p>
            Protected by advanced encryption
          </p>

          <div className="security-bars">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>
    </main>
  );
}