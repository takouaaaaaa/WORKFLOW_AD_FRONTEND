import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/TechniqueDashboard.css";

import {
  Chart,
  BarController,
  LineController,
  DoughnutController,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

import {
  createLogStream,
  getTechniqueDashboardData,
} from "../services/techniqueDashboardService";

Chart.register(
  BarController,
  LineController,
  DoughnutController,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend
);

const QUICK_LINKS = [
  {
    title: "Senders Registry",
    desc: "Monitor sender references and clean technical mapping data.",
    badge: "Monitoring",
    badgeCls: "success",
    link: "/technique/senders",
    btn: "Open Senders",
  },
  {
    title: "Receivers Registry",
    desc: "Control receiver mapping, routing details, and destination health.",
    badge: "Routing",
    badgeCls: "primary",
    link: "/technique/receivers",
    btn: "Open Receivers",
  },
  {
    title: "Type Flux Control",
    desc: "Supervise technical flow categories used by generator and downstream services.",
    badge: "Structure",
    badgeCls: "warning",
    link: "/technique/typeflux",
    btn: "Open Type Flux",
  },
];

function formatDateTime(value) {
  if (!value) return "No timestamp";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function levelClass(level) {
  const v = String(level || "").toUpperCase();
  if (v === "ERROR") return "danger";
  if (v === "WARN" || v === "WARNING") return "warning";
  if (v === "INFO") return "success";
  return "secondary";
}

function sourceClass(source) {
  return source === "AUTOENCODER" ? "autoencoder" : "generator";
}

function LogsTerminal({ logs }) {
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = 0;
  }, [logs]);

  return (
    <div className="monitor-terminal">
      <div className="monitor-terminal-header">
        <div className="d-flex align-items-center gap-2">
          <span className="monitor-live-dot" />
          <span className="monitor-terminal-title">Live Monitoring Feed</span>
        </div>
        <span className="monitor-terminal-subtitle">
          generator + autoencoder
        </span>
      </div>

      <div className="monitor-terminal-body" ref={bodyRef}>
        {logs.length === 0 ? (
          <div className="monitor-empty-log">No logs available.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`monitor-log-line ${levelClass(log.level)}`}>
              <div className="monitor-log-meta">
                <span className={`monitor-source-pill ${sourceClass(log.source)}`}>
                  {log.source}
                </span>
                <span className={`badge text-bg-${levelClass(log.level)} monitor-level-badge`}>
                  {log.level}
                </span>
                <span className="monitor-phase-pill">{log.phase}</span>
                <span className="monitor-log-time">{formatDateTime(log.timestamp)}</span>
              </div>
              <div className="monitor-log-message">{log.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SenderChart({ labels, values }) {
  const ref = useRef(null);

  useEffect(() => {
    const chart = new Chart(ref.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Normal",
            data: values.ok,
            backgroundColor: "rgba(93,168,255,0.72)",
            borderRadius: 10,
            borderSkipped: false,
          },
          {
            label: "Flagged",
            data: values.flagged,
            backgroundColor: "rgba(124,77,255,0.68)",
            borderRadius: 10,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900 },
        plugins: {
          legend: { labels: { boxWidth: 10, usePointStyle: true } },
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, border: { display: false } },
        },
      },
    });

    return () => chart.destroy();
  }, [labels, values]);

  return (
    <div className="monitor-chart-wrap">
      <canvas ref={ref} />
    </div>
  );
}

function AutoencoderChart({ labels, values }) {
  const ref = useRef(null);

  useEffect(() => {
    const chart = new Chart(ref.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Autoencoder Events",
            data: values.received,
            borderColor: "#5DA8FF",
            backgroundColor: "rgba(93,168,255,0.10)",
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: "#5DA8FF",
          },
          {
            label: "Alerts",
            data: values.alerts,
            borderColor: "#7C4DFF",
            backgroundColor: "rgba(124,77,255,0.08)",
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: "#7C4DFF",
            borderDash: [6, 4],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900 },
        plugins: {
          legend: { labels: { boxWidth: 10, usePointStyle: true } },
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, border: { display: false } },
        },
      },
    });

    return () => chart.destroy();
  }, [labels, values]);

  return (
    <div className="monitor-chart-wrap">
      <canvas ref={ref} />
    </div>
  );
}

function HealthDonut({ healthyRate, totalErrors, totalWarnings }) {
  const ref = useRef(null);
  const healthy = Number(String(healthyRate).replace("%", "")) || 0;
  const unhealthy = Math.max(0, 100 - healthy);

  useEffect(() => {
    const chart = new Chart(ref.current, {
      type: "doughnut",
      data: {
        labels: ["Healthy", "Needs attention"],
        datasets: [
          {
            data: [healthy, unhealthy],
            backgroundColor: ["rgba(93,168,255,0.82)", "rgba(124,77,255,0.35)"],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "76%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
      },
    });

    return () => chart.destroy();
  }, [healthy, unhealthy]);

  return (
    <div className="monitor-health-card">
      <div className="monitor-health-chart">
        <canvas ref={ref} />
        <div className="monitor-health-center">
          <div className="monitor-health-value">{healthyRate}</div>
          <div className="monitor-health-label">Healthy rate</div>
        </div>
      </div>

      <div className="monitor-health-meta">
        <div className="monitor-mini-kpi">
          <span className="label">Errors</span>
          <strong>{totalErrors}</strong>
        </div>
        <div className="monitor-mini-kpi">
          <span className="label">Warnings</span>
          <strong>{totalWarnings}</strong>
        </div>
      </div>
    </div>
  );
}

export default function TechniqueDashboard() {
  const [dashboard, setDashboard] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    totalSenders: 0,
    totalReceivers: 0,
    totalTypeFlux: 0,
    stats: {
      totalLogs: 0,
      totalErrors: 0,
      totalWarnings: 0,
      healthyRate: "100%",
      generatorCount: 0,
      autoencoderCount: 0,
    },
    generatorStats: {},
    autoencoderStats: {},
    logs: [],
    senderChart: { ok: [0, 0, 0, 0, 0, 0, 0], flagged: [0, 0, 0, 0, 0, 0, 0] },
    autoencoderChart: { received: [0, 0, 0, 0, 0, 0, 0], alerts: [0, 0, 0, 0, 0, 0, 0] },
  });

  const [loading, setLoading] = useState(true);

  const heroPhrases = useMemo(
    () => [
      `Monitoring ${dashboard.stats.generatorCount} generator events`,
      `Watching ${dashboard.stats.autoencoderCount} autoencoder events`,
      `${dashboard.totalSenders} senders currently referenced`,
      `${dashboard.totalReceivers} receivers mapped`,
      `${dashboard.totalTypeFlux} type flux entries supervised`,
      `${dashboard.stats.totalErrors} errors require technical attention`,
    ],
    [dashboard]
  );

  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % heroPhrases.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [heroPhrases.length]);

  const loadDashboard = async () => {
    try {
      const data = await getTechniqueDashboardData();
      setDashboard(data);
    } catch (error) {
      console.error("Failed to load technique dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const generatorStream = createLogStream("/api/generator/logs/stream", (payload) => {
      const entry = {
        id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        source: "GENERATOR",
        level: String(payload?.level || "INFO").toUpperCase(),
        phase: payload?.phase || payload?.step || "GENERAL",
        message: payload?.message || payload?.details || JSON.stringify(payload),
        timestamp: payload?.timestamp || new Date().toISOString(),
      };

      setDashboard((prev) => ({
        ...prev,
        logs: [entry, ...prev.logs].slice(0, 160),
        stats: {
          ...prev.stats,
          totalLogs: prev.stats.totalLogs + 1,
          generatorCount: prev.stats.generatorCount + 1,
          totalErrors:
            entry.level === "ERROR" ? prev.stats.totalErrors + 1 : prev.stats.totalErrors,
          totalWarnings:
            entry.level === "WARN" ? prev.stats.totalWarnings + 1 : prev.stats.totalWarnings,
        },
      }));
    });

    const autoencoderStream = createLogStream("/api/autoencoder/logs/stream", (payload) => {
      const entry = {
        id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        source: "AUTOENCODER",
        level: String(payload?.level || "INFO").toUpperCase(),
        phase: payload?.phase || payload?.step || "GENERAL",
        message: payload?.message || payload?.details || JSON.stringify(payload),
        timestamp: payload?.timestamp || new Date().toISOString(),
      };

      setDashboard((prev) => ({
        ...prev,
        logs: [entry, ...prev.logs].slice(0, 160),
        stats: {
          ...prev.stats,
          totalLogs: prev.stats.totalLogs + 1,
          autoencoderCount: prev.stats.autoencoderCount + 1,
          totalErrors:
            entry.level === "ERROR" ? prev.stats.totalErrors + 1 : prev.stats.totalErrors,
          totalWarnings:
            entry.level === "WARN" ? prev.stats.totalWarnings + 1 : prev.stats.totalWarnings,
        },
      }));
    });

    return () => {
      generatorStream?.close?.();
      autoencoderStream?.close?.();
    };
  }, []);

  const topStats = [
    {
      label: "Total Logs",
      value: dashboard.stats.totalLogs,
      sub: "Generator + Autoencoder",
      icon: "bi-activity",
    },
    {
      label: "Errors",
      value: dashboard.stats.totalErrors,
      sub: "Critical technical events",
      icon: "bi-exclamation-triangle",
    },
    {
      label: "Warnings",
      value: dashboard.stats.totalWarnings,
      sub: "Need technician review",
      icon: "bi-bell",
    },
    {
      label: "Healthy Rate",
      value: dashboard.stats.healthyRate,
      sub: "Current monitoring health",
      icon: "bi-heart-pulse",
    },
  ];

  if (loading) {
    return (
      <div className="monitor-page d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border monitor-spinner mb-3" role="status" />
          <div className="monitor-loading-text">Loading technical monitoring dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="monitor-page container-fluid py-4">
      <div className="monitor-hero mb-4">
        <div className="row g-4 align-items-stretch">
          <div className="col-12 col-xl-8">
            <div className="monitor-panel hero-panel h-100">
              <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
                <div>
                  <span className="monitor-overline">CURE · technical supervision</span>
                  <h2 className="monitor-title mt-2 mb-2">Real-time Monitoring Dashboard</h2>
                  <p className="monitor-subtitle mb-3">
                    Live supervision of generator logs, autoencoder logs, technical references,
                    and system alert activity.
                  </p>
                  <div className="monitor-floating-status">
                    <span className="monitor-live-dot" />
                    {heroPhrases[phraseIndex]}
                  </div>
                </div>

                <div className="monitor-hero-badges">
                  <span className="badge rounded-pill text-bg-light border">Soft theme</span>
                  <span className="badge rounded-pill text-bg-light border">Bootstrap UI</span>
                  <span className="badge rounded-pill text-bg-light border">Live SSE</span>
                </div>
              </div>

              <div className="row g-3 mt-1">
                {topStats.map((item) => (
                  <div className="col-12 col-sm-6 col-lg-3" key={item.label}>
                    <div className="monitor-stat-card h-100">
                      <div className="monitor-stat-icon">
                        <i className={`bi ${item.icon}`} />
                      </div>
                      <div className="monitor-stat-label">{item.label}</div>
                      <div className="monitor-stat-value">{item.value}</div>
                      <div className="monitor-stat-sub">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <HealthDonut
              healthyRate={dashboard.stats.healthyRate}
              totalErrors={dashboard.stats.totalErrors}
              totalWarnings={dashboard.stats.totalWarnings}
            />
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-8">
          <div className="monitor-panel h-100">
            <div className="monitor-section-header">
              <div>
                <h5 className="mb-1">Live Logs Center</h5>
                <p className="mb-0">Real-time stream from generator and autoencoder services</p>
              </div>
            </div>
            <LogsTerminal logs={dashboard.logs} />
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="monitor-panel h-100">
            <div className="monitor-section-header">
              <div>
                <h5 className="mb-1">Technical Scope</h5>
                <p className="mb-0">Supervised technical reference entities</p>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12">
                <div className="monitor-soft-card">
                  <span className="monitor-soft-label">Senders</span>
                  <h3>{dashboard.totalSenders}</h3>
                </div>
              </div>
              <div className="col-12">
                <div className="monitor-soft-card">
                  <span className="monitor-soft-label">Receivers</span>
                  <h3>{dashboard.totalReceivers}</h3>
                </div>
              </div>
              <div className="col-12">
                <div className="monitor-soft-card">
                  <span className="monitor-soft-label">Type Flux</span>
                  <h3>{dashboard.totalTypeFlux}</h3>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <div className="monitor-section-header mb-3">
              <div>
                <h6 className="mb-1">Quick Access</h6>
                <p className="mb-0">Open technical data management screens</p>
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              {QUICK_LINKS.map((task) => (
                <div className="monitor-task-card" key={task.title}>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <h6 className="mb-1">{task.title}</h6>
                      <p className="mb-2">{task.desc}</p>
                    </div>
                    <span className={`badge text-bg-${task.badgeCls}`}>{task.badge}</span>
                  </div>
                  <Link to={task.link} className="btn monitor-outline-btn btn-sm">
                    {task.btn}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-6">
          <div className="monitor-panel h-100">
            <div className="monitor-section-header">
              <div>
                <h5 className="mb-1">Generator Activity</h5>
                <p className="mb-0">Normal vs flagged generator events over the week</p>
              </div>
            </div>
            <SenderChart labels={dashboard.labels} values={dashboard.senderChart} />
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="monitor-panel h-100">
            <div className="monitor-section-header">
              <div>
                <h5 className="mb-1">Autoencoder Activity</h5>
                <p className="mb-0">All events vs alert events over the week</p>
              </div>
            </div>
            <AutoencoderChart labels={dashboard.labels} values={dashboard.autoencoderChart} />
          </div>
        </div>
      </div>
    </div>
  );
}