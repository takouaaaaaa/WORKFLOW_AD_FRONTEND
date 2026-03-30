import { useState } from "react";
import { loginUser } from "../services/api";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser({ email, motDePasse });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
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
        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              className="login-input"
            />
          </div>
          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      
      </div>
    </div>
  );
}