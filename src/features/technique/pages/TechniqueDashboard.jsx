import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../../technique/styles/TechniqueDashboard.css";
// If you don't use react-router-dom, replace <Link to={...}> with <a href={...}>
// Chart.js must be installed: npm install chart.js

import {
  Chart,
  BarController, LineController,
  BarElement, LineElement, PointElement,
  CategoryScale, LinearScale,
  Filler, Tooltip,
} from "chart.js";

Chart.register(
  BarController, LineController,
  BarElement, LineElement, PointElement,
  CategoryScale, LinearScale,
  Filler, Tooltip
);

/* ─── DATA ─── */
const TECH_STATS = [
  { label: "AI Decisions",    value: "284",   cls: "ok",   sub: "Validated today"},
  { label: "Manual Reviews",  value: "17",    cls: "warn", sub: "Need technician action"},
  { label: "Learned Patterns",value: "63",    cls: "ok",   sub: "Correction rules stored" },
  { label: "Confidence Avg",  value: "96.2%", cls: "ok",   sub: "Prediction reliability" },
];

const AI_TASKS = [
  {
    title: "Anomaly Detection",
    desc:  "Detect technical inconsistencies and suspicious patterns before they impact processing.",
    badge: "Monitoring", badgeCls: "ok",
    link: "/technique/senders", btn: "Open Senders",
  },
  {
    title: "Correction Learning",
    desc:  "Learn from technician validations and reuse previous solutions automatically.",
    badge: "Learning", badgeCls: "learn",
    link: "/technique/receivers", btn: "Open Receivers",
  },
  {
    title: "Flow Intelligence",
    desc:  "Analyze flow types and assist technical supervision across all channels.",
    badge: "AI Support", badgeCls: "ai",
    link: "/technique/typeflux", btn: "Open Type Flux",
  },
];

const COG_PHRASES = [
  "Scanning sender anomalies across 284 validated flows...",
  "Cross-referencing receiver load against learned patterns...",
  "Confidence threshold: 96.2% — all systems nominal.",
  "17 manual reviews queued — prioritizing by severity...",
  "Applying correction rule #63 to recurring pattern...",
  "Flow intelligence: detecting irregular type distribution...",
  "Predicting next technician action based on history...",
  "Receiver throughput spike detected — flagging for review...",
];

const LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ─── BRAIN CANVAS ─── */
function BrainCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 320, H = 320, cx = W / 2, cy = H / 2;

    const nodes = Array.from({ length: 22 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const r = 30 + Math.random() * 100;
      return {
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 2 + Math.random() * 3,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        active: Math.random() > 0.4,
      };
    });

    const signals = [];
    const CONNECTION_RANGE = 110;

    const fireInterval = setInterval(() => {
      const a = Math.floor(Math.random() * nodes.length);
      let b;
      do { b = Math.floor(Math.random() * nodes.length); } while (b === a);
      const na = nodes[a], nb = nodes[b];
      if (Math.hypot(na.x - nb.x, na.y - nb.y) < CONNECTION_RANGE) {
        signals.push({ ax: na.x, ay: na.y, bx: nb.x, by: nb.y, t: 0, duration: 40 + Math.random() * 30 });
      }
    }, 180);

    let frame = 0;
    let rafId;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      frame++;

      const isDark = matchMedia("(prefers-color-scheme: dark)").matches;
      const bgColor    = isDark ? "#1a1a1a"                       : "#f8f8f8";
      const nodeColor  = isDark ? "#1D9E75"                       : "#0F6E56";
      const nodeGlow   = isDark ? "rgba(29,158,117,0.15)"         : "rgba(15,110,86,0.10)";
      const lineColor  = isDark ? "rgba(29,158,117,0.12)"         : "rgba(15,110,86,0.08)";
      const signalColor= isDark ? "#5DCAA5"                       : "#1D9E75";

      // bg circle
      ctx.beginPath();
      ctx.arc(cx, cy, 155, 0, Math.PI * 2);
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.strokeStyle = isDark ? "rgba(29,158,117,0.2)" : "rgba(15,110,86,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // move nodes
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        n.pulse += n.pulseSpeed;
        if (Math.hypot(n.x - cx, n.y - cy) > 140) { n.vx *= -1; n.vy *= -1; }
        if (n.x < 20 || n.x > W - 20) n.vx *= -1;
        if (n.y < 20 || n.y > H - 20) n.vy *= -1;
      });

      // connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < CONNECTION_RANGE) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = lineColor;
            ctx.stroke();
          }
        }
      }

      // signals
      for (let i = signals.length - 1; i >= 0; i--) {
        signals[i].t++;
        const p = signals[i].t / signals[i].duration;
        if (p <= 1) {
          const sx = signals[i].ax + (signals[i].bx - signals[i].ax) * p;
          const sy = signals[i].ay + (signals[i].by - signals[i].ay) * p;
          ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fillStyle = signalColor; ctx.fill();
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 10);
          g.addColorStop(0, isDark ? "rgba(93,202,165,0.5)" : "rgba(29,158,117,0.4)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(sx, sy, 10, 0, Math.PI * 2);
          ctx.fillStyle = g; ctx.fill();
        } else {
          signals.splice(i, 1);
        }
      }

      // nodes
      nodes.forEach(n => {
        const pulsed = n.size + Math.sin(n.pulse) * 0.8;
        if (n.active) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, pulsed * 4);
          g.addColorStop(0, nodeGlow); g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(n.x, n.y, pulsed * 4, 0, Math.PI * 2);
          ctx.fillStyle = g; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(n.x, n.y, pulsed, 0, Math.PI * 2);
        ctx.fillStyle = n.active ? nodeColor : (isDark ? "rgba(29,158,117,0.3)" : "rgba(15,110,86,0.25)");
        ctx.fill();
      });

      // central core
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.04);
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22 + pulse * 6);
      cg.addColorStop(0, isDark ? "rgba(93,202,165,0.9)" : "rgba(29,158,117,0.85)");
      cg.addColorStop(0.5, isDark ? "rgba(29,158,117,0.5)" : "rgba(15,110,86,0.4)");
      cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(cx, cy, 22 + pulse * 6, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "#5DCAA5" : "#1D9E75"; ctx.fill();

      rafId = requestAnimationFrame(draw);
    }

    draw();
    return () => { cancelAnimationFrame(rafId); clearInterval(fireInterval); };
  }, []);

  return <canvas ref={canvasRef} className="brain-canvas" width={320} height={320} />;
}

/* ─── CHARTS ─── */
function SenderChart() {
  const ref = useRef(null);
  useEffect(() => {
    const chart = new Chart(ref.current, {
      type: "bar",
      data: {
        labels: LABELS,
        datasets: [
          { label: "OK",      data: [210,240,198,260,284,190,225], backgroundColor: "rgba(29,158,117,0.7)", borderRadius: 4, borderSkipped: false },
          { label: "Flagged", data: [12,8,15,9,17,6,10],           backgroundColor: "rgba(186,117,23,0.7)",  borderRadius: 4, borderSkipped: false },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: "index" } },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 }, color: "#888" } },
          y: { stacked: true, grid: { color: "rgba(128,128,128,0.1)" }, ticks: { font: { size: 10 }, color: "#888", maxTicksLimit: 5 }, border: { display: false } },
        },
      },
    });
    return () => chart.destroy();
  }, []);
  return <div className="chart-wrap"><canvas ref={ref} /></div>;
}

function ReceiverChart() {
  const ref = useRef(null);
  useEffect(() => {
    const chart = new Chart(ref.current, {
      type: "line",
      data: {
        labels: LABELS,
        datasets: [
          { label: "Received",  data: [310,290,340,320,380,280,330], borderColor: "#185FA5", backgroundColor: "rgba(24,95,165,0.07)",  tension: 0.45, fill: true, pointRadius: 3, pointBackgroundColor: "#185FA5", borderWidth: 1.5 },
          { label: "Processed", data: [295,278,328,310,361,270,318], borderColor: "#534AB7", backgroundColor: "rgba(83,74,183,0.05)",  tension: 0.45, fill: true, pointRadius: 3, pointBackgroundColor: "#534AB7", borderWidth: 1.5, borderDash: [4, 3] },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: "index" } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#888" } },
          y: { grid: { color: "rgba(128,128,128,0.1)" }, ticks: { font: { size: 10 }, color: "#888", maxTicksLimit: 5 }, border: { display: false } },
        },
      },
    });
    return () => chart.destroy();
  }, []);
  return <div className="chart-wrap"><canvas ref={ref} /></div>;
}

/* ─── MAIN COMPONENT ─── */
export default function TechniqueDashboard() {
  const [cogIdx, setCogIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCogIdx(i => (i + 1) % COG_PHRASES.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="td-main">

      {/* STATS */}
      <div className="td-stats-row">
        {TECH_STATS.map(s => (
          <div key={s.label} className={`td-stat-card ${s.cls}`}>
            <span className="td-stat-icon">{s.icon}</span>
            <div className="td-stat-label">{s.label}</div>
            <div className={`td-stat-value ${s.cls}`}>{s.value}</div>
            <div className="td-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="td-main-grid">

        {/* AI BRAIN */}
        <div className="td-ai-card">
          <div className="td-brain-wrap">
            <BrainCanvas />
          </div>
          <div className="td-ai-name">CURE · Tech AI Supervisor</div>
          <div className="td-ai-status">
            <div className="td-dot" />
            Active · Thinking and assisting technician
          </div>
          <div className="td-cog-bar">
            <div className="td-cog-label">Live cognition</div>
            <div className="td-cog-ticker">{COG_PHRASES[cogIdx]}</div>
          </div>
          <div className="td-metrics">
            {[
              { val: "96.2%", lbl: "Confidence" },
              { val: "121ms", lbl: "Response time" },
              { val: "17",    lbl: "Pending reviews" },
            ].map(m => (
              <div key={m.lbl} className="td-metric">
                <div className="td-metric-val">{m.val}</div>
                <div className="td-metric-lbl">{m.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TASKS */}
        <div className="td-tasks-card">
          <div className="td-card-title">AI Functionalities</div>
          {AI_TASKS.map(task => (
            <div key={task.title} className="td-task-item">
              <div className="td-task-header">
                <span className="td-task-title">{task.title}</span>
                <span className={`td-badge ${task.badgeCls}`}>{task.badge}</span>
              </div>
              <div className="td-task-desc">{task.desc}</div>
              <Link to={task.link} className="td-task-btn">{task.btn}</Link>
            </div>
          ))}
        </div>
      </div>

      {/* CHARTS */}
      <div className="td-chart-row">

        <div className="td-chart-card">
          <div className="td-chart-header">
            <div>
              <div className="td-chart-title">Sender Activity</div>
              <div className="td-chart-sub">Last 7 days — flows processed</div>
            </div>
            <div className="td-legend">
              <span className="td-legend-item"><span className="td-legend-dot" style={{background:"#1D9E75"}} />OK</span>
              <span className="td-legend-item"><span className="td-legend-dot" style={{background:"#BA7517"}} />Flagged</span>
            </div>
          </div>
          <SenderChart />
        </div>

        <div className="td-chart-card">
          <div className="td-chart-header">
            <div>
              <div className="td-chart-title">Receiver Load</div>
              <div className="td-chart-sub">Last 7 days — throughput volume</div>
            </div>
            <div className="td-legend">
              <span className="td-legend-item"><span className="td-legend-dot" style={{background:"#185FA5"}} />Received</span>
              <span className="td-legend-item"><span className="td-legend-dot" style={{background:"#534AB7"}} />Processed</span>
            </div>
          </div>
          <ReceiverChart />
        </div>

      </div>
    </div>
  );
}