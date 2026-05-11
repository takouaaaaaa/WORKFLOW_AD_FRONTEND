import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/TechniqueDashboard.css";

import {
  Chart,
  BarController,
  LineController,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
} from "chart.js";

import {
  getTechniqueDashboardData,
  getGeneratorLogs,
} from "../services/techniqueDashboardService";

Chart.register(
  BarController,
  LineController,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip
);

const AI_TASKS = [
  {
    title: "Sender Supervision",
    desc: "Monitor sender references and keep technical data clean and up to date.",
    badge: "Monitoring",
    badgeCls: "ok",
    link: "/technique/senders",
    btn: "Open Senders",
  },
  {
    title: "Receiver Control",
    desc: "Review receiver references and maintain correct receiver mappings.",
    badge: "Reference",
    badgeCls: "learn",
    link: "/technique/receivers",
    btn: "Open Receivers",
  },
  {
    title: "Flow Type Tracking",
    desc: "Check flow type integrity and supervise technical routing data.",
    badge: "Structure",
    badgeCls: "ai",
    link: "/technique/typeflux",
    btn: "Open Type Flux",
  },
];

const LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ─── LOGS TERMINAL ─── */
function LogsTerminal({ logs, cogPhrase }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="td-logs-terminal">
      <div className="td-logs-header">
        <span className="td-dot-green" />
        <span className="td-logs-title">flux-generator · Live Logs</span>
        <span className="td-logs-cognition">{cogPhrase}</span>
      </div>
      <div className="td-logs-body">
        {logs.map((line, i) => {
          const isError  = line.includes("ERROR") || line.includes("failed");
          const isInsert = line.includes("Inserted");
          const isRun    = line.includes("Run #");
          const isSleep  = line.includes("Sleeping");
          return (
            <div
              key={i}
              className={`td-log-line ${
                isError  ? "error"  :
                isInsert ? "insert" :
                isRun    ? "run"    :
                isSleep  ? "sleep"  : ""
              }`}
            >
              {line}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

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

      const nodeColor   = "#7C4DFF";
      const nodeGlow    = "rgba(124,77,255,0.16)";
      const lineColor   = "rgba(124,77,255,0.12)";
      const signalColor = "#5DA8FF";
      const coreLight   = "#5DA8FF";

      ctx.beginPath();
      ctx.arc(cx, cy, 155, 0, Math.PI * 2);
      ctx.fillStyle = "#0f1728";
      ctx.fill();
      ctx.strokeStyle = "rgba(124,77,255,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();

      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy; n.pulse += n.pulseSpeed;
        if (Math.hypot(n.x - cx, n.y - cy) > 140) { n.vx *= -1; n.vy *= -1; }
        if (n.x < 20 || n.x > W - 20) n.vx *= -1;
        if (n.y < 20 || n.y > H - 20) n.vy *= -1;
      });

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

      for (let i = signals.length - 1; i >= 0; i--) {
        signals[i].t++;
        const p = signals[i].t / signals[i].duration;
        if (p <= 1) {
          const sx = signals[i].ax + (signals[i].bx - signals[i].ax) * p;
          const sy = signals[i].ay + (signals[i].by - signals[i].ay) * p;
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fillStyle = signalColor;
          ctx.fill();
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 10);
          g.addColorStop(0, "rgba(93,168,255,0.5)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath();
          ctx.arc(sx, sy, 10, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        } else {
          signals.splice(i, 1);
        }
      }

      nodes.forEach((n) => {
        const pulsed = n.size + Math.sin(n.pulse) * 0.8;
        if (n.active) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, pulsed * 4);
          g.addColorStop(0, nodeGlow);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath();
          ctx.arc(n.x, n.y, pulsed * 4, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulsed, 0, Math.PI * 2);
        ctx.fillStyle = n.active ? nodeColor : "rgba(124,77,255,0.25)";
        ctx.fill();
      });

      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.04);
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22 + pulse * 6);
      cg.addColorStop(0, "rgba(93,168,255,0.95)");
      cg.addColorStop(0.5, "rgba(124,77,255,0.45)");
      cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 22 + pulse * 6, 0, Math.PI * 2);
      ctx.fillStyle = cg;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = coreLight;
      ctx.fill();

      rafId = requestAnimationFrame(draw);
    }

    draw();
    return () => { cancelAnimationFrame(rafId); clearInterval(fireInterval); };
  }, []);

  return <canvas ref={canvasRef} className="brain-canvas" width={320} height={320} />;
}

/* ─── CHARTS ─── */
function SenderChart({ values }) {
  const ref = useRef(null);
  useEffect(() => {
    const chart = new Chart(ref.current, {
      type: "bar",
      data: {
        labels: LABELS,
        datasets: [
          { label: "OK",      data: values.ok,     backgroundColor: "rgba(93,168,255,0.72)", borderRadius: 4, borderSkipped: false },
          { label: "Flagged", data: values.flagged, backgroundColor: "rgba(124,77,255,0.65)", borderRadius: 4, borderSkipped: false },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: "index" } },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 }, color: "#8ea3bf" } },
          y: { stacked: true, grid: { color: "rgba(255,255,255,0.06)" }, ticks: { font: { size: 10 }, color: "#8ea3bf", maxTicksLimit: 5 }, border: { display: false } },
        },
      },
    });
    return () => chart.destroy();
  }, [values]);
  return <div className="chart-wrap"><canvas ref={ref} /></div>;
}

function ReceiverChart({ values }) {
  const ref = useRef(null);
  useEffect(() => {
    const chart = new Chart(ref.current, {
      type: "line",
      data: {
        labels: LABELS,
        datasets: [
          { label: "Received",  data: values.received,  borderColor: "#5DA8FF", backgroundColor: "rgba(93,168,255,0.08)",  tension: 0.45, fill: true, pointRadius: 3, pointBackgroundColor: "#5DA8FF", borderWidth: 1.5 },
          { label: "Processed", data: values.processed, borderColor: "#7C4DFF", backgroundColor: "rgba(124,77,255,0.06)", tension: 0.45, fill: true, pointRadius: 3, pointBackgroundColor: "#7C4DFF", borderWidth: 1.5, borderDash: [4, 3] },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: "index" } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#8ea3bf" } },
          y: { grid: { color: "rgba(255,255,255,0.06)" }, ticks: { font: { size: 10 }, color: "#8ea3bf", maxTicksLimit: 5 }, border: { display: false } },
        },
      },
    });
    return () => chart.destroy();
  }, [values]);
  return <div className="chart-wrap"><canvas ref={ref} /></div>;
}

/* ─── MAIN COMPONENT ─── */
export default function TechniqueDashboard() {
  const [dashboard, setDashboard] = useState({
    totalSenders: 0,
    totalReceivers: 0,
    totalTypeFlux: 0,
    stats: { aiDecisions: 0, manualReviews: 0, learnedPatterns: 0, confidenceAvg: "0%" },
    senderChart:   { ok: [0,0,0,0,0,0,0], flagged: [0,0,0,0,0,0,0] },
    receiverChart: { received: [0,0,0,0,0,0,0], processed: [0,0,0,0,0,0,0] },
  });

  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [cogIdx,  setCogIdx]  = useState(0);

  const COG_PHRASES = useMemo(() => [
    `Monitoring ${dashboard.totalSenders} active senders in the network...`,
    `${dashboard.totalReceivers} receivers mapped and verified...`,
    `${dashboard.totalTypeFlux} flow types tracked across the system...`,
    `Inserting 5 new Flux / FileIn / FileOut records every 10 minutes...`,
    `FileIN flows carry app_reference — FileOUT flows carry app_reference_out...`,
    `${dashboard.stats.manualReviews} flows flagged for manual review...`,
    `60% of flux records generate a linked FileOut entry...`,
    `Settlement dates extended by 2–10 days on INBUSINESSERROR status...`,
    `Confidence threshold: ${dashboard.stats.confidenceAvg} — system stable.`,
    `Scanning for duplicate app_reference across ${dashboard.totalSenders + dashboard.totalReceivers} entities...`,
    `FileOUT status pool: INITIAL, SENT, SENTANDWAITINGACK, ACKED, REJECTED...`,
    `FileIN status pool: INIT, INPROCESS, PROCESSED, REJECTED, BLOCKED...`,
    `Running batch #${Math.floor(Date.now() / 600000) % 1000} — all records committed successfully...`,
  ], [dashboard]);

  useEffect(() => {
    const t = setInterval(() => setCogIdx((i) => (i + 1) % COG_PHRASES.length), 3200);
    return () => clearInterval(t);
  }, [COG_PHRASES.length]);

  const loadDashboard = async () => {
    try {
      const [data, logsData] = await Promise.all([
        getTechniqueDashboardData(),
        getGeneratorLogs(),
      ]);
      setDashboard(data);
      setLogs(logsData);
    } catch (error) {
      console.error("Failed to load technique dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 7000);
    return () => clearInterval(interval);
  }, []);

  const TECH_STATS = [
    { label: "AI Decisions",     value: dashboard.stats.aiDecisions,    cls: "ok",   sub: "Validated automatically" },
    { label: "Manual Reviews",   value: dashboard.stats.manualReviews,  cls: "warn", sub: "Need technician action" },
    { label: "Learned Patterns", value: dashboard.stats.learnedPatterns, cls: "ok",  sub: "Stored correction logic" },
    { label: "Confidence Avg",   value: dashboard.stats.confidenceAvg,  cls: "ok",   sub: "Prediction reliability" },
  ];

  if (loading) {
    return (
      <div className="td-main" style={{ alignItems: "center", justifyContent: "center" }}>
        <div className="td-loader" />
      </div>
    );
  }

  return (
    <div className="td-main">
      {/* ── STATS ── */}
      <div className="td-stats-row">
        {TECH_STATS.map((s) => (
          <div key={s.label} className={`td-stat-card ${s.cls}`}>
            <div className="td-stat-label">{s.label}</div>
            <div className={`td-stat-value ${s.cls}`}>{s.value}</div>
            <div className="td-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="td-main-grid">
        {/* AI Card */}
        <div className="td-ai-card">
          <div className="td-brain-wrap">
            <BrainCanvas />
          </div>

          <div className="td-ai-name">CURE · Tech AI Supervisor</div>

          <div className="td-ai-status">
            <div className="td-dot" />
            Active · Thinking and assisting technician
          </div>

          {/* Live Logs Terminal — cognition phrase now lives inside the header */}
          <LogsTerminal logs={logs} cogPhrase={COG_PHRASES[cogIdx]} />

          <div className="td-metrics">
            {[
              { val: dashboard.stats.confidenceAvg,      lbl: "Confidence" },
              { val: `${dashboard.totalSenders}`,         lbl: "Senders" },
              { val: `${dashboard.stats.manualReviews}`,  lbl: "Pending reviews" },
            ].map((m) => (
              <div key={m.lbl} className="td-metric">
                <div className="td-metric-val">{m.val}</div>
                <div className="td-metric-lbl">{m.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Card */}
        <div className="td-tasks-card">
          <div className="td-card-title">AI Functionalities</div>
          {AI_TASKS.map((task) => (
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

      {/* ── CHARTS ── */}
      <div className="td-chart-row">
        <div className="td-chart-card">
          <div className="td-chart-header">
            <div>
              <div className="td-chart-title">Sender Activity</div>
              <div className="td-chart-sub">Last 7 days — flows processed</div>
            </div>
            <div className="td-legend">
              <span className="td-legend-item"><span className="td-legend-dot" style={{ background: "#5DA8FF" }} />OK</span>
              <span className="td-legend-item"><span className="td-legend-dot" style={{ background: "#7C4DFF" }} />Flagged</span>
            </div>
          </div>
          <SenderChart values={dashboard.senderChart} />
        </div>

        <div className="td-chart-card">
          <div className="td-chart-header">
            <div>
              <div className="td-chart-title">Receiver Load</div>
              <div className="td-chart-sub">Last 7 days — throughput volume</div>
            </div>
            <div className="td-legend">
              <span className="td-legend-item"><span className="td-legend-dot" style={{ background: "#5DA8FF" }} />Received</span>
              <span className="td-legend-item"><span className="td-legend-dot" style={{ background: "#7C4DFF" }} />Processed</span>
            </div>
          </div>
          <ReceiverChart values={dashboard.receiverChart} />
        </div>
      </div>
    </div>
  );
}