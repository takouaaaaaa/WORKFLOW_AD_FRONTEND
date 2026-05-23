import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { createPortal } from "react-dom";
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
  Legend,
} from "chart.js";

import {
  createLogStream,
  getTechniqueDashboardData,
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

function getTodayIndex() {
  const today = new Date().getDay();
  return today === 0 ? 6 : today - 1;
}

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

function isWarning(log) {
  return ["WARN", "WARNING"].includes(String(log?.level || "").toUpperCase());
}

function isError(log) {
  return String(log?.level || "").toUpperCase() === "ERROR";
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
            <div
              key={log.id}
              className={`monitor-log-line ${levelClass(log.level)}`}
            >
              <div className="monitor-log-meta">
                <span className={`monitor-source-pill ${sourceClass(log.source)}`}>
                  {log.source}
                </span>

                <span className={`badge text-bg-${levelClass(log.level)}`}>
                  {log.level}
                </span>

                <span className="monitor-phase-pill">{log.phase}</span>

                <span className="monitor-log-time">
                  {formatDateTime(log.timestamp)}
                </span>
              </div>

              <div className="monitor-log-message">{log.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AlertsModal({ show, type, logs, onClose }) {
  if (!show) return null;

  const title = type === "ERROR" ? "Error Logs" : "Warning Logs";
  const isErrorType = type === "ERROR";

  return createPortal(
    <>
      <div className="monitor-modal-backdrop" onClick={onClose} />

      <div className="monitor-modal-shell">
        <div className="monitor-modal-card">
          <div className="monitor-modal-header">
            <div>
              <div className="d-flex align-items-center gap-2">
                <span
                  className={`monitor-modal-main-badge ${
                    isErrorType ? "error" : "warning"
                  }`}
                >
                  {type}
                </span>

                <h5 className="monitor-modal-title">{title}</h5>
              </div>

              <p className="monitor-modal-subtitle">
                {logs.length} event(s) found in live monitoring logs
              </p>
            </div>

            <button
              type="button"
              className="monitor-modal-close"
              onClick={onClose}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="monitor-modal-body">
            {logs.length === 0 ? (
              <div className="monitor-modal-empty">
                No {type.toLowerCase()} logs found.
              </div>
            ) : (
              <div className="monitor-alert-list">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`monitor-alert-item ${levelClass(log.level)}`}
                  >
                    <div className="monitor-alert-top">
                      <span
                        className={`monitor-alert-badge ${
                          log.level === "ERROR" ? "error" : "warn"
                        }`}
                      >
                        {log.level}
                      </span>

                      <span
                        className={`monitor-source-pill ${sourceClass(
                          log.source
                        )}`}
                      >
                        {log.source}
                      </span>

                      <span className="monitor-phase-light">{log.phase}</span>

                      <span className="monitor-alert-time">
                        {formatDateTime(log.timestamp)}
                      </span>
                    </div>

                    <div className="monitor-alert-message">{log.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="monitor-modal-footer">
            <button className="btn btn-secondary px-4" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

function SenderChart({ labels, values }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    chartRef.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Normal",
            data: values.ok,
            backgroundColor: "rgba(0, 255, 204, 0.35)",
            borderColor: "rgba(0, 255, 204, 0.8)",
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.7,
          },
          {
            label: "Flagged",
            data: values.flagged,
            backgroundColor: "rgba(255, 68, 68, 0.55)",
            borderColor: "rgba(255, 68, 68, 0.9)",
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800 },
        plugins: {
          legend: {
            labels: {
              color: "rgba(255,255,255,0.85)",
              boxWidth: 14,
              usePointStyle: true,
              pointStyle: "circle",
              padding: 16,
              font: { size: 13, weight: "600" },
            },
          },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.8)",
            titleFont: { size: 14, weight: "700" },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8,
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { 
              color: "rgba(255,255,255,0.6)",
              font: { size: 12, weight: "500" },
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            border: { display: false },
            grid: { 
              color: "rgba(255,255,255,0.06)",
              drawBorder: false,
            },
            ticks: { 
              color: "rgba(255,255,255,0.6)",
              font: { size: 12 },
              stepSize: 2,
            },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.data.labels = labels;
    chartRef.current.data.datasets[0].data = values.ok;
    chartRef.current.data.datasets[1].data = values.flagged;
    chartRef.current.update();
  }, [labels, values]);

  return (
    <div className="monitor-chart-wrap">
      <canvas ref={ref} />
    </div>
  );
}

function AutoencoderChart({ labels, values }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    chartRef.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Autoencoder Events",
            data: values.received,
            borderColor: "#00ffcc",
            backgroundColor: "rgba(0, 255, 204, 0.08)",
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: "#00ffcc",
            pointBorderColor: "#03101c",
            pointBorderWidth: 2,
          },
          {
            label: "Alerts",
            data: values.alerts,
            borderColor: "#ff4444",
            backgroundColor: "rgba(255, 68, 68, 0.06)",
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: "#ff4444",
            pointBorderColor: "#03101c",
            pointBorderWidth: 2,
            borderDash: [6, 4],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800 },
        plugins: {
          legend: {
            labels: {
              color: "rgba(255,255,255,0.85)",
              boxWidth: 14,
              usePointStyle: true,
              pointStyle: "circle",
              padding: 16,
              font: { size: 13, weight: "600" },
            },
          },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.8)",
            titleFont: { size: 14, weight: "700" },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8,
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { 
              color: "rgba(255,255,255,0.6)",
              font: { size: 12, weight: "500" },
            },
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { 
              color: "rgba(255,255,255,0.06)",
              drawBorder: false,
            },
            ticks: { 
              color: "rgba(255,255,255,0.6)",
              font: { size: 12 },
              stepSize: 2,
            },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.data.labels = labels;
    chartRef.current.data.datasets[0].data = values.received;
    chartRef.current.data.datasets[1].data = values.alerts;
    chartRef.current.update();
  }, [labels, values]);

  return (
    <div className="monitor-chart-wrap">
      <canvas ref={ref} />
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
    logs: [],
    senderChart: {
      ok: [0, 0, 0, 0, 0, 0, 0],
      flagged: [0, 0, 0, 0, 0, 0, 0],
    },
    autoencoderChart: {
      received: [0, 0, 0, 0, 0, 0, 0],
      alerts: [0, 0, 0, 0, 0, 0, 0],
    },
  });

  const [loading, setLoading] = useState(true);

  const [alertModal, setAlertModal] = useState({
    show: false,
    type: "ERROR",
  });

  const errorLogs = useMemo(
    () => dashboard.logs.filter(isError),
    [dashboard.logs]
  );

  const warningLogs = useMemo(
    () => dashboard.logs.filter(isWarning),
    [dashboard.logs]
  );

  const selectedAlertLogs =
    alertModal.type === "ERROR" ? errorLogs : warningLogs;

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
    const generatorStream = createLogStream(
      "/api/generator/logs/stream",
      (payload) => {
        const entry = {
          id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          source: "GENERATOR",
          level: String(payload?.level || "INFO").toUpperCase(),
          phase: payload?.phase || payload?.step || "GENERAL",
          message:
            payload?.message || payload?.details || JSON.stringify(payload),
          timestamp: payload?.timestamp || new Date().toISOString(),
        };

        setDashboard((prev) => {
          const idx = getTodayIndex();
          const updatedOk = [...prev.senderChart.ok];
          const updatedFlagged = [...prev.senderChart.flagged];

          if (["WARN", "WARNING", "ERROR"].includes(entry.level)) {
            updatedFlagged[idx] += 1;
          } else {
            updatedOk[idx] += 1;
          }

          const totalLogs = prev.stats.totalLogs + 1;
          const totalErrors =
            entry.level === "ERROR"
              ? prev.stats.totalErrors + 1
              : prev.stats.totalErrors;

          const totalWarnings =
            entry.level === "WARN" || entry.level === "WARNING"
              ? prev.stats.totalWarnings + 1
              : prev.stats.totalWarnings;

          const healthyRate =
            totalLogs > 0
              ? `${Math.max(
                  0,
                  Math.round(((totalLogs - totalErrors) / totalLogs) * 100)
                )}%`
              : "100%";

          return {
            ...prev,
            senderChart: {
              ok: updatedOk,
              flagged: updatedFlagged,
            },
            logs: [entry, ...prev.logs].slice(0, 160),
            stats: {
              ...prev.stats,
              totalLogs,
              generatorCount: prev.stats.generatorCount + 1,
              totalErrors,
              totalWarnings,
              healthyRate,
            },
          };
        });
      }
    );

    const autoencoderStream = createLogStream(
      "/api/autoencoder/logs/stream",
      (payload) => {
        const entry = {
          id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          source: "AUTOENCODER",
          level: String(payload?.level || "INFO").toUpperCase(),
          phase: payload?.phase || payload?.step || "GENERAL",
          message:
            payload?.message || payload?.details || JSON.stringify(payload),
          timestamp: payload?.timestamp || new Date().toISOString(),
        };

        setDashboard((prev) => {
          const idx = getTodayIndex();
          const updatedReceived = [...prev.autoencoderChart.received];
          const updatedAlerts = [...prev.autoencoderChart.alerts];

          updatedReceived[idx] += 1;

          if (["WARN", "WARNING", "ERROR"].includes(entry.level)) {
            updatedAlerts[idx] += 1;
          }

          const totalLogs = prev.stats.totalLogs + 1;
          const totalErrors =
            entry.level === "ERROR"
              ? prev.stats.totalErrors + 1
              : prev.stats.totalErrors;

          const totalWarnings =
            entry.level === "WARN" || entry.level === "WARNING"
              ? prev.stats.totalWarnings + 1
              : prev.stats.totalWarnings;

          const healthyRate =
            totalLogs > 0
              ? `${Math.max(
                  0,
                  Math.round(((totalLogs - totalErrors) / totalLogs) * 100)
                )}%`
              : "100%";

          return {
            ...prev,
            autoencoderChart: {
              received: updatedReceived,
              alerts: updatedAlerts,
            },
            logs: [entry, ...prev.logs].slice(0, 160),
            stats: {
              ...prev.stats,
              totalLogs,
              autoencoderCount: prev.stats.autoencoderCount + 1,
              totalErrors,
              totalWarnings,
              healthyRate,
            },
          };
        });
      }
    );

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
      clickable: false,
    },
    {
      label: "Errors",
      value: dashboard.stats.totalErrors,
      sub: "Critical technical events",
      icon: "bi-exclamation-triangle",
      clickable: true,
      type: "ERROR",
    },
    {
      label: "Warnings",
      value: dashboard.stats.totalWarnings,
      sub: "Need technician review",
      icon: "bi-bell",
      clickable: true,
      type: "WARNING",
    },
    {
      label: "Healthy Rate",
      value: dashboard.stats.healthyRate,
      sub: "Current monitoring health",
      icon: "bi-heart-pulse",
      clickable: false,
    },
  ];

  if (loading) {
    return (
      <div className="monitor-page d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border monitor-spinner mb-3" role="status" />
          <div className="monitor-loading-text">
            Loading technical monitoring dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="technique-dashboard-wrapper">
      <div className="monitor-page container-fluid py-4">
        <AlertsModal
          show={alertModal.show}
          type={alertModal.type}
          logs={selectedAlertLogs}
          onClose={() => setAlertModal({ show: false, type: "ERROR" })}
        />

        <div className="monitor-hero mb-4">
          <div className="monitor-panel hero-panel">
            <div className="monitor-header-wrapper mb-3">
              <div className="monitor-overline">
                <span>CURE · TECHNICAL SUPERVISION</span>

                <button className="monitor-live-btn">
                  <span className="monitor-live-dot" />
                  {heroPhrases[phraseIndex]}
                </button>
              </div>
            </div>

            <h2 className="monitor-hero-title">What's about to break.</h2>
            <p className="monitor-hero-subtitle">Before it does.</p>

            <div className="row g-4 mt-4">
              {topStats.map((item) => (
                <div className="col-6 col-xl-3" key={item.label}>
                  <button
                    type="button"
                    disabled={!item.clickable}
                    onClick={() =>
                      item.clickable &&
                      setAlertModal({ show: true, type: item.type })
                    }
                    className={`monitor-stat-card h-100 w-100 text-start ${
                      item.clickable ? "monitor-stat-clickable" : ""
                    } ${
                      item.type === "ERROR"
                        ? "monitor-stat-error"
                        : item.type === "WARNING"
                        ? "monitor-stat-warning"
                        : ""
                    }`}
                  >
                    <div className="monitor-stat-icon">
                      <i className={`bi ${item.icon}`} />
                    </div>

                    <div className="monitor-stat-label">{item.label}</div>
                    <div className="monitor-stat-value">{item.value}</div>
                    <div className="monitor-stat-sub">{item.sub}</div>

                    {item.clickable && (
                      <div className="monitor-click-hint">
                        Click to view details
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <h6 className="first_title">Manage Data Flow</h6>

          {QUICK_LINKS.map((task) => (
            <div className="col-12 col-md-4" key={task.title}>
              <div className="monitor-task-card h-100">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <h6 className="mb-1">{task.title}</h6>
                    <p className="mb-2">{task.desc}</p>
                  </div>

                  <span className={`badge text-bg-${task.badgeCls}`}>
                    {task.badge}
                  </span>
                </div>

                <Link to={task.link} className="btn monitor-outline-btn btn-sm">
                  {task.btn}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="monitor-panel">
              <div className="mb-4 text-center">
                <h2 className="monitor-logs-title">Live Logs</h2>
                <p className="monitor-logs-subtitle">
                  Real-time stream from generator and autoencoder services
                </p>
              </div>

              <LogsTerminal logs={dashboard.logs} />
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-xl-6">
            <div className="monitor-panel h-100">
              <div className="monitor-section-header">
                <div>
                  <h5 className="mb-1">Generator Activity</h5>
                  <p className="mb-0">Normal vs flagged events over the week</p>
                </div>
              </div>

              <SenderChart
                labels={dashboard.labels}
                values={dashboard.senderChart}
              />
            </div>
          </div>

          <div className="col-12 col-xl-6">
            <div className="monitor-panel h-100">
              <div className="monitor-section-header">
                <div>
                  <h5 className="mb-1">Autoencoder Activity</h5>
                  <h6 className="mb-0">
                    All events vs alert events over the week
                  </h6>
                </div>
              </div>

              <AutoencoderChart
                labels={dashboard.labels}
                values={dashboard.autoencoderChart}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}