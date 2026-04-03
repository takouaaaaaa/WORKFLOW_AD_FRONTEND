import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { getUserFromToken, setTokens } from "../utils/auth";
import { ROLES } from "../../../app/routeConfig";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectByRole = (user) => {
    if (!user?.roles?.length) {
      console.log("No roles found in token");
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

    console.log("Role not matched:", user.roles);
    setError("Unauthorized role");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("FORM SUBMITTED");

    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email, motDePasse });
      console.log("LOGIN RESPONSE:", res.data);

      setTokens(res.data.accessToken, res.data.refreshToken);

      const user = getUserFromToken();
      console.log("DECODED USER:", user);

      redirectByRole(user);
    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data || err.message);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-badge">CURE PLATFORM</div>
        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to your account</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <input
              type="password"
              className="login-input"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}