import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { createPortal } from "react-dom";
import "../styles/TechniqueDashboard.css";
import { getToken } from "../../../auth/utils/auth";

import {
  Chart,
  LineController,
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
  LineController,
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
    desc: "Monitor sender references and mapping data.",
    badge: "Monitoring",
    badgeCls: "success",
    link: "/technique/senders",
    btn: "Open Senders",
  },
  {
    title: "Receivers Registry",
    desc: "Control routing and receiver mapping.",
    badge: "Routing",
    badgeCls: "primary",
    link: "/technique/receivers",
    btn: "Open Receivers",
  },
  {
    title: "Flow Type Control",
    desc: "Manage technical flow structures.",
    badge: "Structure",
    badgeCls: "warning",
    link: "/technique/typeflux",
    btn: "Open Flow Types",
  },
];

const exportCbrExcel = async () => {
  try {
    const token = getToken();

    const response = await fetch("/api/reports/cbr/last24h/pdf", { 
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "cbr-report-last24h.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert("Erreur lors de l'export PDF CBR");
  }
};

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

function AlertsModal({ show, type, logs, onClose }) {
  if (!show) return null;

  const isErrorType = type === "ERROR";
  const title = isErrorType ? "Error Logs" : "Warning Logs";

  const cleanLogs = logs.filter((log) => {
    const level = String(log?.level || "").toUpperCase();
    return isErrorType ? level === "ERROR" : ["WARN", "WARNING"].includes(level);
  });

  return createPortal(
    <>
      <div className="monitor-modal-backdrop" onClick={onClose} />

      <div className="monitor-modal-shell">
        <div className="monitor-modal-card monitor-modal-dark">
          <div className="monitor-modal-header">
            <div>
              <div className="d-flex align-items-center gap-3">
                <span
                  className={`monitor-modal-main-badge ${
                    isErrorType ? "error" : "warning"
                  }`}
                >
                  {isErrorType ? "ERROR" : "WARNING"}
                </span>

                <h5 className="monitor-modal-title">{title}</h5>
              </div>

              <p className="monitor-modal-subtitle">
                {cleanLogs.length} event(s) found
              </p>
            </div>

            <button
              type="button"
              className="monitor-modal-close"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <div className="monitor-modal-body">
            {cleanLogs.length === 0 ? (
              <div className="monitor-modal-empty-dark">
                <div className="monitor-empty-icon">
                  {isErrorType ? "✖" : "⚠"}
                </div>

                <h4>No {isErrorType ? "Errors" : "Warnings"} Found</h4>

                <p>
                  The monitoring system did not detect any{" "}
                  {isErrorType ? "critical errors" : "warning events"}.
                </p>
              </div>
            ) : (
              <div className="monitor-alert-list">
                {cleanLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`monitor-alert-item-dark ${
                      isErrorType ? "error" : "warning"
                    }`}
                  >
                    <div className="monitor-alert-top">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span
                          className={`monitor-alert-badge ${
                            isErrorType ? "error" : "warn"
                          }`}
                        >
                          {String(log.level || type).toUpperCase()}
                        </span>

                        <span
                          className={`monitor-source-pill ${sourceClass(
                            log.source
                          )}`}
                        >
                          {log.source || "SYSTEM"}
                        </span>

                        <span className="monitor-phase-light">
                          {log.phase || "GENERAL"}
                        </span>
                      </div>

                      <span className="monitor-alert-time">
                        {formatDateTime(log.timestamp)}
                      </span>
                    </div>

                    <div className="monitor-alert-message">
                      {log.message || "No message available"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="monitor-modal-footer">
            <button className="btn monitor-modal-dark-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

function MiniCurve({ type, logs }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    chartRef.current?.destroy();

    const last = logs.slice(0, 12).reverse();

    const labels = last.length
      ? last.map((_, i) => `T${i + 1}`)
      : ["T1", "T2", "T3", "T4", "T5", "T6"];

    const values = last.length
      ? last.map((log, i) => {
          const level = String(log.level || "").toUpperCase();

          if (type === "autoencoder") {
            if (level === "ERROR") return 0.92;
            if (level === "WARN" || level === "WARNING") return 0.65;
            return 0.22 + i * 0.02;
          }

          if (level === "ERROR") return 85;
          if (level === "WARN" || level === "WARNING") return 55;
          return 25 + i * 3;
        })
      : type === "autoencoder"
      ? [0.18, 0.22, 0.25, 0.31, 0.38, 0.28]
      : [20, 35, 28, 42, 58, 47];

    const threshold =
      type === "autoencoder" ? values.map(() => 0.5) : values.map(() => 60);

    chartRef.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label:
              type === "autoencoder" ? "Reconstruction error" : "CBR score",
            data: values,
            borderColor: "#00ffcc",
            backgroundColor: "rgba(0, 255, 204, 0.08)",
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: "#00ffcc",
          },
          {
            label: "Threshold",
            data: threshold,
            borderColor: "#ff4444",
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "rgba(255,255,255,0.75)",
              boxWidth: 10,
              usePointStyle: true,
              font: { size: 11 },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "rgba(255,255,255,0.45)", font: { size: 10 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: { color: "rgba(255,255,255,0.45)", font: { size: 10 } },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [logs, type]);

  return (
    <div className="monitor-mini-curve">
      <canvas ref={ref} />
    </div>
  );
}

function MathBox({ type }) {
  if (type === "AUTOENCODER") {
    return (
      <div className="monitor-math-box">
        <div className="monitor-math-title">Autoencoder Logic</div>

        <div className="monitor-formula">
          Compare original data with reconstructed data
        </div>

        <p>
          The AI reads the File IN data, rebuilds it, then checks if the rebuilt
          version is very different from the original. If the difference is too
          high, the system marks the flow as suspicious or anomalous.
        </p>
      </div>
    );
  }

  return (
    <div className="monitor-math-box">
      <div className="monitor-math-title">CBR Logic</div>

      <div className="monitor-formula">
        Compare current case with previous cases
      </div>

      <p>
        CBR looks at old similar cases already handled by the system. If it
        finds a very similar situation, it suggests a decision based on what
        happened before.
      </p>
    </div>
  );
}

function LogsSection({ title, subtitle, logs, source }) {
  const errors = logs.filter((l) => l.level === "ERROR").length;
  const warnings = logs.filter((l) =>
    ["WARN", "WARNING"].includes(l.level)
  ).length;
  const healthy = logs.filter(
    (l) => !["ERROR", "WARN", "WARNING"].includes(l.level)
  ).length;

  return (
    <div className="monitor-panel h-100 monitor-clean-card">
      <div className="monitor-clean-head">
        <div>
          <h5>{title}</h5>
          <p>{subtitle}</p>
        </div>

        <span
          className={`monitor-clean-badge ${
            source === "AUTOENCODER" ? "autoencoder" : "generator"
          }`}
        >
          {source === "AUTOENCODER" ? "IA" : "CBR"}
        </span>
      </div>

      <div className="monitor-clean-grid">
        <div>
          <span>Total Events</span>
          <strong>{logs.length}</strong>
        </div>

        <div>
          <span>Errors</span>
          <strong className="danger">{errors}</strong>
        </div>

        <div>
          <span>Warnings</span>
          <strong className="warning">{warnings}</strong>
        </div>

        <div>
          <span>Healthy</span>
          <strong className="success">{healthy}</strong>
        </div>
      </div>

      <MiniCurve
        type={source === "AUTOENCODER" ? "autoencoder" : "generator"}
        logs={logs}
      />

      <MathBox type={source} />

      <div className="monitor-mini-terminal mt-4">
        <div className="monitor-terminal-header">
          <div className="d-flex align-items-center gap-2">
            <span className="monitor-live-dot" />

            <span className="monitor-terminal-title">
              {source === "AUTOENCODER" ? "Autoencoder Logs" : "CBR Logs"}
            </span>
          </div>

          <span className="monitor-terminal-subtitle">
            {source.toLowerCase()}
          </span>
        </div>

        <div className="monitor-terminal-body">
          {logs.length === 0 ? (
            <div className="monitor-empty-log">No logs available.</div>
          ) : (
            logs.slice(0, 20).map((log) => (
              <div
                key={log.id}
                className={`monitor-log-line ${levelClass(log.level)}`}
              >
                <div className="monitor-log-meta">
                  <span
                    className={`monitor-source-pill ${sourceClass(log.source)}`}
                  >
                    {log.source}
                  </span>

                  <span className={`badge text-bg-${levelClass(log.level)}`}>
                    {log.level}
                  </span>

                  <span className="monitor-phase-pill">
                    {log.phase || "GENERAL"}
                  </span>

                  <span className="monitor-log-time">
                    {formatDateTime(log.timestamp)}
                  </span>
                </div>

                <div className="monitor-log-message">
                  {log.message || "No message available"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function TechniqueDashboard() {
  const [dashboard, setDashboard] = useState({
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

  const generatorLogs = useMemo(
    () => dashboard.logs.filter((l) => l.source === "GENERATOR"),
    [dashboard.logs]
  );

  const autoencoderLogs = useMemo(
    () => dashboard.logs.filter((l) => l.source === "AUTOENCODER"),
    [dashboard.logs]
  );

  const selectedAlertLogs =
    alertModal.type === "ERROR" ? errorLogs : warningLogs;

  const heroPhrases = useMemo(
    () => [
      `Monitoring ${dashboard.stats.generatorCount} generator events`,
      `Watching ${dashboard.stats.autoencoderCount} autoencoder events`,
      `${dashboard.totalSenders} senders referenced`,
      `${dashboard.totalReceivers} receivers mapped`,
      `${dashboard.totalTypeFlux} flow types supervised`,
      `${dashboard.stats.totalErrors} errors require attention`,
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

    const refresh = setInterval(() => {
      loadDashboard();
    }, 60000);

    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    const generatorStream = createLogStream(
      "/api/generator/logs/stream",
      (payload) => {
        const entry = {
          id: `g-${Date.now()}`,
          source: "GENERATOR",
          level: String(payload?.level || "INFO").toUpperCase(),
          phase: payload?.phase || payload?.step || "GENERAL",
          message:
            payload?.message || payload?.details || JSON.stringify(payload),
          timestamp: payload?.timestamp || new Date().toISOString(),
        };

        setDashboard((prev) => ({
          ...prev,
          logs: [entry, ...prev.logs].slice(0, 200),
        }));
      }
    );

    const autoencoderStream = createLogStream(
      "/api/autoencoder/logs/stream",
      (payload) => {
        const entry = {
          id: `a-${Date.now()}`,
          source: "AUTOENCODER",
          level: String(payload?.level || "INFO").toUpperCase(),
          phase: payload?.phase || payload?.step || "GENERAL",
          message:
            payload?.message || payload?.details || JSON.stringify(payload),
          timestamp: payload?.timestamp || new Date().toISOString(),
        };

        setDashboard((prev) => ({
          ...prev,
          logs: [entry, ...prev.logs].slice(0, 200),
        }));
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
  value: errorLogs.length,
  sub: "Critical events",
  icon: "bi-exclamation-triangle",
  clickable: true,
  type: "ERROR",
},
{
  label: "Warnings",
  value: warningLogs.length,
  sub: "Need review",
  icon: "bi-bell",
  clickable: true,
  type: "WARNING",
},
    {
      label: "Healthy Rate",
      value: dashboard.stats.healthyRate,
      sub: "Monitoring health",
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
            Loading technical dashboard...
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
          onClose={() =>
            setAlertModal({
              show: false,
              type: "ERROR",
            })
          }
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
            
            <button className="btn btn-success" onClick={exportCbrExcel }>
                Export Daily PDF Report
            </button>

            <div className="row g-4 mt-4">
              {topStats.map((item) => (
                <div className="col-6 col-xl-3" key={item.label}>
                  <button
                    type="button"
                    disabled={!item.clickable}
                    onClick={() =>
                      item.clickable &&
                      setAlertModal({
                        show: true,
                        type: item.type,
                      })
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

        <div className="row g-4">
          <div className="col-12 col-xl-6">
            <LogsSection
              title="CBR / Generator Intelligence"
              subtitle="Similarity-based decision engine and CBR logs"
              logs={generatorLogs}
              source="GENERATOR"
            />
          </div>

          <div className="col-12 col-xl-6">
            <LogsSection
              title="Autoencoder AI Intelligence"
             subtitle="Reconstruction error, anomaly threshold and AI logs"
              logs={autoencoderLogs}
              source="AUTOENCODER"
            />
          </div>
        </div>
      </div>
    </div>
  );
}