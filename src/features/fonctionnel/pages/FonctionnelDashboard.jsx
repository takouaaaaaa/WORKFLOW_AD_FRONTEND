import { useEffect, useRef, useState } from "react";
import "../styles/Dashboard.css";
import { getAllFlux, getAllFileIn, getAllFileOut } from "../services/dashboardService";

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend
);

const MONITORS = [
  { name: "MFT", time: "Live monitor unavailable" },
  { name: "MQ", time: "Live monitor unavailable" },
  { name: "PASAP", time: "Live monitor unavailable" },
];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFlowRef(flow) {
  return flow?.appReference || flow?.appReferenceOut || flow?.ref || "-";
}

function getFlowType(flow) {
  if (flow?.flowType?.flowType) return flow.flowType.flowType;
  if (flow?.typeFlux?.flowType) return flow.typeFlux.flowType;
  if (flow?.flowType) return flow.flowType;
  if (flow?.type) return flow.type;
  return "-";
}

function getFlowStatus(flow) {
  return (
    flow?.mergedStatus ||
    flow?.statutFluxIN ||
    flow?.statutFluxIn ||
    flow?.statutFluxOUT ||
    flow?.statutFluxOut ||
    flow?.status ||
    "N/A"
  );
}

function getBadgeClass(status) {
  const s = (status || "").toUpperCase();

  if (
    s.includes("ERROR") ||
    s.includes("REJECTED") ||
    s.includes("FAILED") ||
    s.includes("BLOCKED") ||
    s.includes("CANCELED") ||
    s.includes("CANCELLED")
  ) {
    return "danger";
  }

  if (
    s.includes("PROCESSED") ||
    s.includes("SENT") ||
    s.includes("ACKED") ||
    s.includes("SUCCESS")
  ) {
    return "ok";
  }

  if (
    s.includes("WAIT") ||
    s.includes("QUEUE") ||
    s.includes("INIT") ||
    s.includes("PROCESS")
  ) {
    return "warn";
  }

  return "ok";
}

function enrichFluxData(fluxData, fileInData, fileOutData) {
  const fileInMap = new Map();
  const fileOutMap = new Map();

  fileInData.forEach((item) => {
    const ref = item?.appReference;
    if (ref) fileInMap.set(ref, item);
  });

  fileOutData.forEach((item) => {
    const ref = item?.appReference;
    if (ref) fileOutMap.set(ref, item);
  });

  return fluxData.map((flux) => {
    const ref = flux?.appReference;
    const fileIn = fileInMap.get(ref);
    const fileOut = fileOutMap.get(ref);

    return {
      ...flux,
      mergedStatus:
        fileIn?.statutFluxIN ||
        fileIn?.statutFluxIn ||
        fileOut?.statutFluxOUT ||
        fileOut?.statutFluxOut ||
        flux?.status ||
        "N/A",
      mergedDate:
        fileOut?.updateDate ||
        fileOut?.creationDate ||
        fileIn?.sendingDate ||
        fileIn?.settlementDate ||
        flux?.creationDate ||
        flux?.updateDate ||
        null,
    };
  });
}

function buildNotifications(fileOutData, fileInData) {
  const notifications = [];

  fileOutData
    .filter(
      (item) =>
        item?.statutFluxOUT === "ERRORREPORTEDTOSENDER" ||
        item?.statutFluxOut === "ERRORREPORTEDTOSENDER"
    )
    .slice(0, 4)
    .forEach((item) => {
      notifications.push({
        type: "error",
        label: "⚠ Error Detected",
        ref: item?.appReference || item?.appReferenceOut,
        time: formatDate(item?.updateDate || item?.creationDate),
        msg: "FileOut en erreur : ERRORREPORTEDTOSENDER",
      });
    });

  fileInData
    .filter(
      (item) =>
        item?.statutFluxIN === "PROCESSED" ||
        item?.statutFluxIn === "PROCESSED"
    )
    .slice(0, 2)
    .forEach((item) => {
      notifications.push({
        type: "success",
        label: "✓ Flow Completed",
        ref: item?.appReference,
        time: formatDate(item?.sendingDate || item?.settlementDate),
        msg: "Flux traité avec succès : PROCESSED",
      });
    });

  fileInData
    .filter((item) => {
      const status = item?.statutFluxIN || item?.statutFluxIn;
      return (
        status === "INPROCESS" ||
        status === "WAITACTION" ||
        status === "INITIATED"
      );
    })
    .slice(0, 2)
    .forEach((item) => {
      notifications.push({
        type: "warning",
        label: "⚡ Flow Pending",
        ref: item?.appReference,
        time: formatDate(item?.sendingDate || item?.settlementDate),
        msg: `Flux en attente : ${item?.statutFluxIN || item?.statutFluxIn}`,
      });
    });

  return notifications.slice(0, 6);
}

function buildChartData(fluxData, fileInData, fileOutData) {
  const groupByDay = (items, getDate, getStatus = null) => {
    const grouped = {};

    items.forEach((item) => {
      const rawDate = getDate(item);
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (isNaN(date.getTime())) return;

      const label = date.toLocaleDateString("fr-FR");

      if (!grouped[label]) {
        grouped[label] = {
          total: 0,
          processed: 0,
          error: 0,
          waiting: 0,
          inProgress: 0,
        };
      }

      grouped[label].total += 1;

      if (getStatus) {
        const status = (getStatus(item) || "").toUpperCase();

        if (
          status === "PROCESSED" ||
          status === "SENT" ||
          status === "ACKED" ||
          status === "SUCCESS"
        ) {
          grouped[label].processed += 1;
        } else if (
          status === "ERRORREPORTEDTOSENDER" ||
          status.includes("ERROR") ||
          status.includes("FAILED") ||
          status.includes("BLOCKED") ||
          status.includes("REJECTED")
        ) {
          grouped[label].error += 1;
        } else if (
          status.includes("WAIT") ||
          status.includes("INIT")
        ) {
          grouped[label].waiting += 1;
        } else {
          grouped[label].inProgress += 1;
        }
      }
    });

    return grouped;
  };

  const fileInGrouped = groupByDay(
    fileInData,
    (item) => item?.sendingDate || item?.settlementDate || item?.creationDate
  );

  const fileOutGrouped = groupByDay(
    fileOutData,
    (item) => item?.updateDate || item?.creationDate,
    (item) => item?.statutFluxOUT || item?.statutFluxOut
  );

  const fluxGrouped = groupByDay(
    fluxData,
    (item) => item?.mergedDate || item?.creationDate || item?.updateDate
  );

  const labels = Array.from(
    new Set([
      ...Object.keys(fileInGrouped),
      ...Object.keys(fileOutGrouped),
      ...Object.keys(fluxGrouped),
    ])
  ).sort((a, b) => {
    const [da, ma, ya] = a.split("/");
    const [db, mb, yb] = b.split("/");
    return new Date(`${ya}-${ma}-${da}`) - new Date(`${yb}-${mb}-${db}`);
  });

  return {
    labels,
    bars: labels.map((label) => fluxGrouped[label]?.total || 0),
    inCounts: labels.map((label) => fileInGrouped[label]?.total || 0),
    outCounts: labels.map((label) => fileOutGrouped[label]?.total || 0),
    processedCounts: labels.map((label) => fileOutGrouped[label]?.processed || 0),
    errorCounts: labels.map((label) => fileOutGrouped[label]?.error || 0),
    waitingCounts: labels.map((label) => fileOutGrouped[label]?.waiting || 0),
    inProgressCounts: labels.map((label) => fileOutGrouped[label]?.inProgress || 0),
  };
}

function NotificationPanel({ notifications }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`palm-notif-drawer ${open ? "open" : ""}`}>
      <button
        type="button"
        className="palm-notif-handle"
        onClick={() => setOpen(!open)}
      >
        <span className="palm-notif-handle-text">
          {open ? "Close" : "AI Notifications"}
        </span>
        <span className="palm-notif-handle-count">{notifications.length}</span>
      </button>

      <div className="palm-notif-panel">
        <div className="palm-notif-header">
          <div className="palm-notif-title-wrap">
            <div className="palm-notif-title">AI Notifications</div>
            <div className="palm-notif-subtitle">
              Dernières alertes détectées
            </div>
          </div>

          <button
            className="palm-notif-toggle"
            onClick={() => setOpen(false)}
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="palm-notif-list">
          {notifications.length === 0 ? (
            <div className="palm-notif-item info">
              <div className="palm-notif-type">ℹ No notifications</div>
              <div className="palm-notif-msg">
                Aucune notification récente trouvée.
              </div>
              <div className="palm-notif-time">Now</div>
            </div>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className={`palm-notif-item ${n.type}`}>
                <div className="palm-notif-type">{n.label}</div>
                <div className="palm-notif-msg">{n.msg}</div>
                {n.ref && <div className="palm-notif-ref">{n.ref}</div>}
                <div className="palm-notif-time">{n.time}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FileInOutChart({ labels, inCounts, outCounts }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "File IN",
            data: inCounts,
            borderColor: "#00b4ff",
            backgroundColor: "rgba(0,180,255,0.10)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: "#00b4ff",
            pointBorderColor: "#00b4ff",
          },
          {
            label: "File OUT",
            data: outCounts,
            borderColor: "#00ffb3",
            backgroundColor: "rgba(0,255,179,0.07)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: "#00ffb3",
            pointBorderColor: "#00ffb3",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(5,13,26,0.92)",
            borderColor: "rgba(0,180,255,0.25)",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            titleColor: "#e0f0ff",
            bodyColor: "#5a7a9a",
          },
        },
        scales: {
          x: {
            ticks: {
              font: { size: 10 },
              color: "#5a7a9a",
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 7,
            },
            grid: { color: "rgba(0,180,255,0.06)" },
            border: { color: "rgba(0,180,255,0.1)" },
          },
          y: {
            ticks: { font: { size: 10 }, color: "#5a7a9a", stepSize: 1 },
            grid: { color: "rgba(0,180,255,0.06)" },
            border: { color: "rgba(0,180,255,0.1)" },
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [labels, inCounts, outCounts]);

  return <canvas ref={canvasRef} />;
}

function FluxAvancementChart({
  labels,
  processedCounts,
  errorCounts,
  waitingCounts,
  inProgressCounts,
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Traités",
            data: processedCounts,
            borderColor: "#00ffb3",
            backgroundColor: "rgba(0,255,179,0.07)",
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: "#00ffb3",
          },
          {
            label: "En attente",
            data: waitingCounts,
            borderColor: "#ff9f43",
            backgroundColor: "rgba(255,159,67,0.07)",
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: "#ff9f43",
          },
          {
            label: "Erreurs",
            data: errorCounts,
            borderColor: "#ff4d6d",
            backgroundColor: "rgba(255,77,109,0.07)",
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: "#ff4d6d",
          },
          {
            label: "En cours",
            data: inProgressCounts,
            borderColor: "#00b4ff",
            backgroundColor: "rgba(0,180,255,0.07)",
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: "#00b4ff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(5,13,26,0.92)",
            borderColor: "rgba(0,180,255,0.25)",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            titleColor: "#e0f0ff",
            bodyColor: "#5a7a9a",
          },
        },
        scales: {
          x: {
            ticks: {
              font: { size: 10 },
              color: "#5a7a9a",
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 7,
            },
            grid: { color: "rgba(0,180,255,0.06)" },
            border: { color: "rgba(0,180,255,0.1)" },
          },
          y: {
            ticks: { font: { size: 10 }, color: "#5a7a9a", stepSize: 1 },
            grid: { color: "rgba(0,180,255,0.06)" },
            border: { color: "rgba(0,180,255,0.1)" },
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [labels, processedCounts, errorCounts, waitingCounts, inProgressCounts]);

  return <canvas ref={canvasRef} />;
}

export default function FonctionnelDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    synthese: 0,
    jobsEnErreur: 0,
    aiProcessed: 0,
    totalFileIn: 0,
  });

  const [recentFlows, setRecentFlows] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [chartBars, setChartBars] = useState([]);
  const [chartLabels, setChartLabels] = useState([]);

  const [inCounts, setInCounts] = useState([]);
  const [outCounts, setOutCounts] = useState([]);
  const [processedCounts, setProcessedCounts] = useState([]);
  const [errorCounts, setErrorCounts] = useState([]);
  const [waitingCounts, setWaitingCounts] = useState([]);
  const [inProgressCounts, setInProgressCounts] = useState([]);

  const totalIn = inCounts.reduce((a, b) => a + b, 0);
  const totalOut = outCounts.reduce((a, b) => a + b, 0);
  const totalProcessed = processedCounts.reduce((a, b) => a + b, 0);
  const totalErrors = errorCounts.reduce((a, b) => a + b, 0);
  const totalWaiting = waitingCounts.reduce((a, b) => a + b, 0);
  const totalInProgress = inProgressCounts.reduce((a, b) => a + b, 0);

  const successRate = totalOut > 0 ? Math.round((totalProcessed / totalOut) * 100) : 0;
  const errorRate = totalOut > 0 ? Math.round((totalErrors / totalOut) * 100) : 0;

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 7000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [fluxRes, fileInRes, fileOutRes] = await Promise.all([
        getAllFlux(),
        getAllFileIn(),
        getAllFileOut(),
      ]);

      const fluxData = Array.isArray(fluxRes.data) ? fluxRes.data : [];
      const fileInData = Array.isArray(fileInRes.data) ? fileInRes.data : [];
      const fileOutData = Array.isArray(fileOutRes.data) ? fileOutRes.data : [];

      const enrichedFlux = enrichFluxData(fluxData, fileInData, fileOutData);

      const jobsEnErreur = fileOutData.filter(
        (item) =>
          item?.statutFluxOUT === "ERRORREPORTEDTOSENDER" ||
          item?.statutFluxOut === "ERRORREPORTEDTOSENDER"
      ).length;

      const aiProcessed = fileInData.filter(
        (item) =>
          item?.statutFluxIN === "PROCESSED" ||
          item?.statutFluxIn === "PROCESSED"
      ).length;

      const sortedRecentFlows = [...enrichedFlux]
        .sort((a, b) => new Date(b?.mergedDate || 0) - new Date(a?.mergedDate || 0))
        .slice(0, 5);

      const chartData = buildChartData(enrichedFlux, fileInData, fileOutData);

      setStats({
        synthese: fluxData.length,
        jobsEnErreur,
        aiProcessed,
        totalFileIn: fileInData.length,
      });

      setRecentFlows(sortedRecentFlows);
      setNotifications(buildNotifications(fileOutData, fileInData));

      setChartBars(chartData.bars);
      setChartLabels(chartData.labels);
      setInCounts(chartData.inCounts);
      setOutCounts(chartData.outCounts);
      setProcessedCounts(chartData.processedCounts);
      setErrorCounts(chartData.errorCounts);
      setWaitingCounts(chartData.waitingCounts);
      setInProgressCounts(chartData.inProgressCounts);
    } catch (error) {
      console.error("Erreur lors du chargement du dashboard :", error);
    } finally {
      setLoading(false);
    }
  };

  const STATS = [
    {
      label: "Synthèse",
      value: loading ? "..." : stats.synthese,
      cls: "warn",
      sub: "Total des flux dans la DB",
      icon: "📊",
    },
    {
      label: "Jobs en erreurs",
      value: loading ? "..." : stats.jobsEnErreur,
      cls: stats.jobsEnErreur > 0 ? "danger" : "ok",
      sub: "FileOut : ERRORREPORTEDTOSENDER",
      icon: "⚙️",
    },
    {
      label: "File IN",
      value: loading ? "..." : stats.totalFileIn,
      cls: "warn",
      sub: "Total FileIn",
      icon: "📥",
    },
    {
      label: "AI Processed",
      value: loading ? "..." : stats.aiProcessed,
      cls: "ok",
      sub: "FileIn : PROCESSED",
      icon: "🤖",
    },
  ];

  return (
    <>
      <div className="palm-main">
        <div className="palm-stat-row">
          {STATS.map((s) => (
            <div key={s.label} className="palm-stat-card">
              <div className="palm-stat-label">{s.label}</div>
              <div className={`palm-stat-value ${s.cls}`}>{s.value}</div>
              <div className="palm-stat-sub">{s.sub}</div>
              <div className="palm-stat-icon">{s.icon}</div>
            </div>
          ))}
        </div>

        <div className="palm-center-grid">
          <div className="palm-ai-card">
            <div className="palm-ai-bg" />
            <div className="palm-orb-wrap">
              <div className="palm-ring2" />
              <div className="palm-ring" />
              <div className="palm-orb" />
            </div>

            <div className="palm-ai-name">CURE · AI ENGINE</div>

            <div className="palm-ai-status">
              <div className="palm-dot" />
              {loading ? "Loading..." : "Online · Dynamic Data"}
            </div>

            <div className="palm-ai-metrics">
              {[
                { val: loading ? "..." : stats.synthese, lbl: "Total Flux" },
                { val: loading ? "..." : stats.jobsEnErreur, lbl: "Error Jobs" },
                { val: loading ? "..." : stats.aiProcessed, lbl: "Processed" },
              ].map((m) => (
                <div key={m.lbl} className="palm-metric">
                  <div className="palm-metric-val">{m.val}</div>
                  <div className="palm-metric-lbl">{m.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="palm-flow-card">
            <div className="palm-card-title">Reference Flow · Recent</div>

            <table className="palm-table">
              <thead>
                <tr>
                  <th>App Ref</th>
                  <th>Flow Type</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentFlows.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "16px" }}>
                      {loading ? "Chargement..." : "Aucune donnée"}
                    </td>
                  </tr>
                ) : (
                  recentFlows.map((f, index) => {
                    const status = getFlowStatus(f);
                    return (
                      <tr key={getFlowRef(f) || index}>
                        <td className="palm-mono">{getFlowRef(f)}</td>
                        <td>{getFlowType(f)}</td>
                        <td>
                          <span className={`palm-badge ${getBadgeClass(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td style={{ fontSize: 11, color: "var(--muted)" }}>
                          {formatDate(f?.mergedDate)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="palm-card-title" style={{ marginTop: 18 }}>
              Monitoring · Services
            </div>

            {MONITORS.map((m) => (
              <div key={m.name} className="palm-monitor-row">
                <span style={{ fontSize: 13 }}>{m.name}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{m.time}</span>
                <span className="palm-badge warn">Static</span>
              </div>
            ))}
          </div>

          <div className="palm-chart-card">
            <div className="palm-card-title">AI Flow Processing · History</div>

            <div className="palm-bars">
              {chartBars.map((h, i) => {
                const maxBar = Math.max(...chartBars, 1);
                const heightPercent = Math.max(8, Math.round((h / maxBar) * 100));

                return (
                  <div
                    key={i}
                    className="palm-bar"
                    style={{ height: `${heightPercent}%` }}
                    title={`${chartLabels[i]} : ${h}`}
                  />
                );
              })}
            </div>

            <div className="palm-bar-labels">
              {chartLabels.map((l, i) => (
                <span key={`${l}-${i}`}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="palm-linechart-card">
          <div className="palm-linechart-header">
            <div>
              <div className="palm-card-title" style={{ marginBottom: 2 }}>
                File IN vs File OUT · Historique complet
              </div>
              <div className="palm-linechart-sub">
                Volume de fichiers reçus et envoyés par jour
              </div>
            </div>

            <div className="palm-linechart-legend">
              <span className="palm-legend-item">
                <span className="palm-legend-dot" style={{ background: "#00b4ff" }} />
                File IN
              </span>
              <span className="palm-legend-item">
                <span className="palm-legend-dot" style={{ background: "#00ffb3" }} />
                File OUT
              </span>
            </div>
          </div>

          <div className="palm-linechart-kpis">
            <div className="palm-kpi">
              <div className="palm-kpi-val" style={{ color: "#00b4ff" }}>
                {loading ? "..." : totalIn}
              </div>
              <div className="palm-kpi-lbl">Total File IN</div>
            </div>

            <div className="palm-kpi">
              <div className="palm-kpi-val" style={{ color: "#00ffb3" }}>
                {loading ? "..." : totalOut}
              </div>
              <div className="palm-kpi-lbl">Total File OUT</div>
            </div>

            <div className="palm-kpi">
              <div className="palm-kpi-val" style={{ color: "#00ffb3" }}>
                {loading ? "..." : `${successRate}%`}
              </div>
              <div className="palm-kpi-lbl">Taux de succès</div>
            </div>

            <div className="palm-kpi">
              <div className="palm-kpi-val" style={{ color: "#ff4d6d" }}>
                {loading ? "..." : `${errorRate}%`}
              </div>
              <div className="palm-kpi-lbl">Taux d'erreur</div>
            </div>
          </div>

          <div className="palm-linechart-canvas-wrap">
            {!loading && chartLabels.length > 0 && (
              <FileInOutChart
                labels={chartLabels}
                inCounts={inCounts}
                outCounts={outCounts}
              />
            )}
          </div>
        </div>

        <div className="palm-linechart-card">
          <div className="palm-linechart-header">
            <div>
              <div className="palm-card-title" style={{ marginBottom: 2 }}>
                Avancement des flux · Statuts
              </div>
              <div className="palm-linechart-sub">
                Évolution du cycle de vie des flux par jour
              </div>
            </div>

            <div className="palm-linechart-legend">
              <span className="palm-legend-item">
                <span className="palm-legend-dot" style={{ background: "#00ffb3" }} />
                Traités
              </span>
              <span className="palm-legend-item">
                <span className="palm-legend-dot" style={{ background: "#ff9f43" }} />
                En attente
              </span>
              <span className="palm-legend-item">
                <span className="palm-legend-dot" style={{ background: "#ff4d6d" }} />
                Erreurs
              </span>
              <span className="palm-legend-item">
                <span className="palm-legend-dot" style={{ background: "#00b4ff" }} />
                En cours
              </span>
            </div>
          </div>

          <div className="palm-progress-summary">
            {[
              { lbl: "Traités", val: totalProcessed, color: "#00ffb3" },
              { lbl: "En attente", val: totalWaiting, color: "#ff9f43" },
              { lbl: "Erreurs", val: totalErrors, color: "#ff4d6d" },
              { lbl: "En cours", val: totalInProgress, color: "#00b4ff" },
            ].map((item) => {
              const total =
                totalProcessed + totalWaiting + totalErrors + totalInProgress || 1;
              const pct = Math.round((item.val / total) * 100);

              return (
                <div key={item.lbl} className="palm-progress-item">
                  <div className="palm-progress-meta">
                    <span style={{ fontSize: 12, color: "var(--text)" }}>
                      {item.lbl}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: item.color,
                        fontFamily: "'Orbitron', monospace",
                      }}
                    >
                      {item.val}{" "}
                      <span style={{ color: "var(--muted)", fontSize: 10 }}>
                        ({pct}%)
                      </span>
                    </span>
                  </div>

                  <div className="palm-progress-bar-bg">
                    <div
                      className="palm-progress-bar-fill"
                      style={{ width: `${pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="palm-linechart-canvas-wrap">
            {!loading && chartLabels.length > 0 && (
              <FluxAvancementChart
                labels={chartLabels}
                processedCounts={processedCounts}
                errorCounts={errorCounts}
                waitingCounts={waitingCounts}
                inProgressCounts={inProgressCounts}
              />
            )}
          </div>
        </div>
      </div>

      <NotificationPanel notifications={notifications} />
    </>
  );
}