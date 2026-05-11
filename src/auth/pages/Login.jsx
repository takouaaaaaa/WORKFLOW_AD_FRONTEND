import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { getUserFromToken, setTokens } from "../utils/auth";
import { ROLES } from "../../app/router/routeConfig";
import "./login.css";
import { Eye, EyeOff, Sparkles, Shield, Zap, Key, Mail } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email, motDePasse });
      setTokens(res.data.accessToken, res.data.refreshToken);
      const user = getUserFromToken();
      redirectByRole(user);
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // Mouse movement effect for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Canvas particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationId;
    let particles = [];
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.color = `hsla(${260 + Math.random() * 40}, 70%, 65%, ${Math.random() * 0.3 + 0.1})`;
        this.angle = Math.random() * Math.PI * 2;
        this.angularSpeed = (Math.random() - 0.5) * 0.02;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.angularSpeed;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 150; i++) {
        particles.push(new Particle());
      }
    };

    const drawGlow = () => {
      // Draw animated gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `hsla(${260 + Math.sin(time) * 10}, 80%, 95%, 1)`);
      gradient.addColorStop(0.5, `hsla(${280 + Math.cos(time * 0.7) * 10}, 75%, 93%, 1)`);
      gradient.addColorStop(1, `hsla(${250 + Math.sin(time * 0.5) * 5}, 85%, 97%, 1)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawWaves = () => {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * (0.6 + i * 0.15));
        for (let x = 0; x < canvas.width; x += 50) {
          const y = canvas.height * (0.6 + i * 0.15) + 
                    Math.sin(x * 0.003 + time * (1 + i * 0.5)) * 30 +
                    Math.cos(x * 0.005 + time * 0.8) * 15;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.fillStyle = `hsla(${260 + i * 20}, 70%, 75%, ${0.08 - i * 0.02})`;
        ctx.fill();
      }
    };

    const drawOrbs = () => {
      const orbs = [
        { x: canvas.width * 0.2, y: canvas.height * 0.3, radius: 200, color: "hsla(260, 80%, 70%, 0.15)" },
        { x: canvas.width * 0.8, y: canvas.height * 0.7, radius: 250, color: "hsla(280, 75%, 65%, 0.12)" },
        { x: canvas.width * 0.5, y: canvas.height * 0.5, radius: 300, color: "hsla(240, 85%, 75%, 0.08)" },
        { x: canvas.width * 0.1, y: canvas.height * 0.8, radius: 180, color: "hsla(300, 70%, 70%, 0.1)" },
        { x: canvas.width * 0.9, y: canvas.height * 0.2, radius: 220, color: "hsla(220, 80%, 75%, 0.12)" },
      ];

      orbs.forEach((orb, index) => {
        const pulse = Math.sin(time * 0.5 + index) * 0.1;
        const xOffset = Math.sin(time * 0.3 + index) * 15;
        const yOffset = Math.cos(time * 0.4 + index) * 15;
        
        const gradient = ctx.createRadialGradient(
          orb.x + xOffset, orb.y + yOffset, orb.radius * 0.3,
          orb.x + xOffset, orb.y + yOffset, orb.radius * (1 + pulse)
        );
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.beginPath();
        ctx.arc(orb.x + xOffset, orb.y + yOffset, orb.radius * (1 + pulse), 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
    };

    const drawConnectingLines = () => {
      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(260, 70%, 65%, ${0.05 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      drawGlow();
      drawWaves();
      drawOrbs();
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      drawConnectingLines();
      
      time += 0.02;
      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animate();

    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="login-page">
      <canvas ref={canvasRef} className="login-canvas" />
      
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      <div 
        className="login-card" 
        style={{
          transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`
        }}
      >
        <div className="card-glow"></div>
        
        <div className="login-header">
          <div className="logo-container">
          
            <div className="logo-text">
              <span className="logo-main">WORKFLOW-AD</span>
              <span className="logo-sub">PLATFORM</span>
            </div>
          </div>
          <div className="header-badge">
            <Sparkles size={12} />
            <span>Secure Access</span>
          </div>
        </div>

        <div className="welcome-section">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to continue your journey</p>
        </div>

        {error && (
          <div className="login-error">
            <Zap size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <div className="input-icon">
              <Mail size={18} />
            </div>
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
            />
            <div className="input-focus-effect"></div>
          </div>

          <div className="input-group">
            <div className="input-icon">
              <Key size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              className="login-input"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <div className="input-focus-effect"></div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            <span className="button-text">{loading ? "Authenticating..." : "Sign in"}</span>
            {!loading && <Zap size={16} className="button-icon" />}
            {loading && <div className="button-spinner"></div>}
          </button>
        </form>

        <div className="login-footer">
          <p>Protected by advanced encryption</p>
          <div className="security-bars">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}