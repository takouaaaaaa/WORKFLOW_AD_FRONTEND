import { useState } from "react";
import { registerUser } from "../services/api";
import "./Register.css";

export default function Register() {
  const [form, setForm] = useState({ email: "", motDePasse: "", numTel: "", role: "USER_FONCTIONNEL" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser({ ...form, numTel: Number(form.numTel) });
      window.location.href = "/";
    } catch (err) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-badge">CURE PLATFORM</div>
        <h1 className="register-title">Create account</h1>
        <p className="register-subtitle">Join the platform today</p>
        {error && <div className="register-error">{error}</div>}
        <form onSubmit={handleRegister} className="register-form">
          <div className="register-field">
            <label className="register-label">Email</label>
            <input type="email" name="email" placeholder="you@example.com" onChange={handleChange} required className="register-input" />
          </div>
          <div className="register-field">
            <label className="register-label">Password</label>
            <input type="password" name="motDePasse" placeholder="••••••••" onChange={handleChange} required className="register-input" />
          </div>
          <div className="register-field">
            <label className="register-label">Phone number</label>
            <input type="number" name="numTel" placeholder="12345678" onChange={handleChange} required className="register-input" />
          </div>
          <div className="register-field">
            <label className="register-label">Role</label>
            <select name="role" onChange={handleChange} className="register-input">
              <option value="USER_FONCTIONNEL">User Fonctionnel</option>
              <option value="USER_TECHNIQUE">User Technique</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="register-button">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="register-footer">
          Already have an account? <a href="/" className="register-link">Sign in</a>
        </p>
      </div>
    </div>
  );
}