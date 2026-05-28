import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

import {
  getAllFlux,
  getAllFileIn,
  getAllFileOut,
} from "../services/dashboardService";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend
);

const FILEIN_ERRORS = [
  { key: "PUTINQUEUEFAILED", label: "Queue failed" },
  { key: "INBUSINESSERROR", label: "Business error" },
  { key: "INTECHNICALERROR", label: "Technical error" },
  { key: "REJECTED", label: "Rejected" },
  { key: "BLOCKED", label: "Blocked" },
  { key: "CANCELED", label: "Canceled" },
];

const FILEOUT_ERRORS = [
  { key: "ERRORREPORTEDTOSENDER", label: "Error reported" },
  { key: "NACKED", label: "Nacked" },
  { key: "REJECTED", label: "Rejected" },
  { key: "CANCELED", label: "Canceled" },
];

const OK_STATUSES = ["PROCESSED", "SENT", "ACKED", "SUCCESS"];

function normalize(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.content)) return res.data.content;
  return [];
}

function getStatus(item) {
  return String(
    item?.status ||
      item?.statusFileIn ||
      item?.statusFileOut ||
      item?.status_file_in ||
      item?.status_file_out ||
      ""
  ).toUpperCase();
}

function getCbrVerdict(item) {
  return String(item?.cbrVerdict || item?.cbr_verdict || "").toUpperCase();
}

const isOk = (s) => OK_STATUSES.includes(String(s || "").toUpperCase());

const isError = (s) =>
  [...FILEIN_ERRORS, ...FILEOUT_ERRORS]
    .map((x) => x.key)
    .includes(String(s || "").toUpperCase());

const isWaiting = (status) =>
  String(status || "").toUpperCase() === "WAITFUNCTIONAL";

function classify(s) {
  if (isOk(s)) return "processed";
  if (isError(s)) return "error";
  if (isWaiting(s)) return "waiting";
  return "inProgress";
}

function chipClass(s) {
  const c = classify(s);
  if (c === "processed") return "ok";
  if (c === "error") return "err";
  if (c === "waiting") return "warn";
  return "unk";
}

function resolveDate(item) {
  const candidates = [
    item?.updateDate,
    item?.creationDate,
    item?.sendingDate,
    item?.settlementDate,
    item?.createdAt,
    item?.updatedAt,
    item?.date,
  ];

  for (const v of candidates) {
    const d = new Date(v);
    if (v && !isNaN(d.getTime())) return v;
  }

  return null;
}

function fmtDate(v) {
  if (!v) return "—";

  const d = new Date(v);
  if (isNaN(d)) return "—";

  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRef(item, type) {
  return (
    item?.appReference ||
    item?.appReferenceOut ||
    item?.reference ||
    item?.senderReference ||
    `${type}-${item?.id || item?.idFlux || item?.idFluxIn || item?.idFluxOut || ""}`
  );
}

function getSenderReference(item) {
  return item?.senderReference || item?.sender_reference || "";
}

function buildRecentActivity(fileInData) {
  return fileInData
    .map((i) => ({
      ref: getRef(i, "IN"),
      status: getStatus(i),
      date: resolveDate(i),
      description: i?.descriptionFileIn || i?.description || i?.message || "—",
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);
}

function buildChartData(fileInData, fileOutData) {
  const grouped = {};

  const add = (item, type) => {
    const raw = resolveDate(item);
    if (!raw) return;

    const d = new Date(raw);
    if (isNaN(d)) return;

    const label = d.toLocaleDateString("fr-FR");
    const cat = classify(getStatus(item));

    if (!grouped[label]) {
      grouped[label] = {
        in: 0,
        out: 0,
        processed: 0,
        error: 0,
        waiting: 0,
        inProgress: 0,
      };
    }

    if (type === "IN") grouped[label].in++;
    else grouped[label].out++;

    grouped[label][cat]++;
  };

  fileInData.forEach((i) => add(i, "IN"));
  fileOutData.forEach((i) => add(i, "OUT"));

  const parseFR = (l) => {
    const [d, m, y] = l.split("/");
    return new Date(`${y}-${m}-${d}`);
  };

  const labels = Object.keys(grouped).sort((a, b) => parseFR(a) - parseFR(b));

  return {
    labels,
    bars: labels.map((l) => grouped[l].in + grouped[l].out),
    inCounts: labels.map((l) => grouped[l].in),
    outCounts: labels.map((l) => grouped[l].out),
    processedCounts: labels.map((l) => grouped[l].processed),
    errorCounts: labels.map((l) => grouped[l].error),
    waitingCounts: labels.map((l) => grouped[l].waiting),
    inProgressCounts: labels.map((l) => grouped[l].inProgress),
  };
}

function buildHourlyVolumeData(fileInData, fileOutData) {
  const grouped = {};

  const add = (item) => {
    const raw = resolveDate(item);
    if (!raw) return;

    const d = new Date(raw);
    if (isNaN(d)) return;

    const key = `${d.toLocaleDateString("fr-FR")} ${String(
      d.getHours()
    ).padStart(2, "0")}:00`;

    if (!grouped[key]) {
      grouped[key] = {
        count: 0,
        timestamp: d.getTime(),
      };
    }

    grouped[key].count++;
  };

  fileInData.forEach(add);
  fileOutData.forEach(add);

  const sorted = Object.entries(grouped).sort(
    (a, b) => a[1].timestamp - b[1].timestamp
  );

  return {
    labels: sorted.map(([key]) => key),
    bars: sorted.map(([, value]) => value.count),
  };
}

function buildNotifications(fileInData = []) {
  return fileInData
    .filter(
      (item) =>
        String(
          item?.cbrVerdict ||
          item?.cbr_verdict ||
          ""
        ).toUpperCase() === "WAITFUNCTIONAL"
    )
    .sort(
      (a, b) =>
        new Date(resolveDate(b)) -
        new Date(resolveDate(a))
    )
    .slice(0, 20)
    .map((item, index) => {

      const desc = String(
        item?.descriptionFileIn || ""
      ).toUpperCase();

      let color = "#f59e0b";
      let bg = "rgba(245,158,11,0.12)";
      let border = "rgba(245,158,11,0.35)";
      let label = "Functional review";

      if (desc.includes("SETTLEMENT_DATE_PAST")) {
        color = "#fb923c";
        bg = "rgba(251,146,60,0.12)";
        border = "rgba(251,146,60,0.35)";
        label = "Settlement anomaly";
      }

      else if (desc.includes("DATA_INCOHERENCE")) {
        color = "#a855f7";
        bg = "rgba(168,85,247,0.12)";
        border = "rgba(168,85,247,0.35)";
        label = "Data incoherence";
      }

      return {
        id: index,
        type: "warning",
        label,
        color,
        bg,
        border,

        ref:
          item?.appReference ||
          item?.senderReference ||
          "UNKNOWN",

        senderReference:
          item?.senderReference || "",

        time: fmtDate(resolveDate(item)),

        msg:
          item?.descriptionFileIn ||
          "Action required from functional user",
      };
    });
}

function LineChartInOut({ labels, inCounts, outCounts }) {

  const ref = useRef(null);
  const chart = useRef(null);

  useEffect(() => {

    if (!ref.current) return;

    chart.current?.destroy();

    const ctx = ref.current.getContext("2d");

    const gradientIn = ctx.createLinearGradient(0, 0, 0, 240);
    gradientIn.addColorStop(0, "rgba(99,102,241,0.35)");
    gradientIn.addColorStop(1, "rgba(99,102,241,0.02)");

    const gradientOut = ctx.createLinearGradient(0, 0, 0, 240);
    gradientOut.addColorStop(0, "rgba(16,185,129,0.30)");
    gradientOut.addColorStop(1, "rgba(16,185,129,0.02)");

    chart.current = new Chart(ctx, {
      type: "line",

      data: {
        labels,

        datasets: [
          {
            label: "File IN",
            data: inCounts,

            borderColor: "#6366f1",
            backgroundColor: gradientIn,

            fill: true,
            tension: 0.42,

            borderWidth: 3,

            pointRadius: 3,
            pointHoverRadius: 6,

            pointBackgroundColor: "#6366f1",
          },

          {
            label: "File OUT",
            data: outCounts,

            borderColor: "#10b981",
            backgroundColor: gradientOut,

            fill: true,
            tension: 0.42,

            borderWidth: 3,

            pointRadius: 3,
            pointHoverRadius: 6,

            pointBackgroundColor: "#10b981",
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
          intersect: false,
          mode: "index",
        },

        plugins: {
          legend: { display: false },

          tooltip: {
            backgroundColor: "rgba(2,10,18,0.96)",
            borderColor: "rgba(255,255,255,0.08)",
            borderWidth: 1,

            titleColor: "#e5edf5",
            bodyColor: "#c8d0d8",

            padding: 12,
          },
        },

        scales: {

          x: {
            grid: {
              color: "rgba(255,255,255,0.04)",
            },

            ticks: {
              color: "rgba(200,208,216,0.70)",
              font: {
                size: 11,
                weight: 700,
              },
            },
          },

          y: {
            beginAtZero: true,

            grid: {
              color: "rgba(255,255,255,0.05)",
            },

            ticks: {
              precision: 0,

              color: "rgba(200,208,216,0.55)",

              font: {
                size: 10,
              },
            },
          },
        },
      },
    });

    return () => chart.current?.destroy();

  }, [labels, inCounts, outCounts]);

  return <canvas ref={ref} />;
}

function LineChartLifecycle({
  labels,
  processedCounts,
  errorCounts,
  waitingCounts,
  inProgressCounts,
}) {
  const ref = useRef(null);
  const chart = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    chart.current?.destroy();

    chart.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Processed",
            data: processedCounts,
            borderColor: "#10b981",
            borderWidth: 1.5,
            tension: 0.4,
            pointRadius: 2,
          },
          {
            label: "Errors",
            data: errorCounts,
            borderColor: "#f43f5e",
            borderWidth: 1.5,
            tension: 0.4,
            pointRadius: 2,
            borderDash: [3, 2],
          },
          {
            label: "In progress",
            data: inProgressCounts,
            borderColor: "#6366f1",
            borderWidth: 1.5,
            tension: 0.4,
            pointRadius: 2,
            borderDash: [5, 3],
          },
          {
            label: "Waiting",
            data: waitingCounts,
            borderColor: "#f59e0b",
            borderWidth: 1.5,
            tension: 0.4,
            pointRadius: 2,
            borderDash: [4, 2],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { font: { size: 9 }, color: "#b0b8cc" },
            grid: { color: "rgba(0,0,0,0.04)" },
          },
          y: {
            beginAtZero: true,
            ticks: { font: { size: 9 }, color: "#b0b8cc" },
            grid: { color: "rgba(0,0,0,0.04)" },
          },
        },
      },
    });

    return () => chart.current?.destroy();
  }, [
    labels,
    processedCounts,
    errorCounts,
    waitingCounts,
    inProgressCounts,
  ]);

  return <canvas ref={ref} />;
}

function HourlyVolumeChart({ labels, bars, loading }) {
  const ref = useRef(null);
  const chart = useRef(null);

  useEffect(() => {
    if (!ref.current || loading || !bars.length) return;

    chart.current?.destroy();

    const ctx = ref.current.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);

    gradient.addColorStop(0, "rgba(0,229,255,0.35)");
    gradient.addColorStop(1, "rgba(0,229,255,0.01)");

    const last24Labels = labels.slice(-24).map((l) => l.split(" ")[1]);
    const last24Bars = bars.slice(-24);

    chart.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: last24Labels,
        datasets: [
          {
            data: last24Bars,
            borderColor: "#00e5ff",
            backgroundColor: gradient,
            fill: true,
            tension: 0.42,
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#00e5ff",
            pointHoverBorderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(2,10,18,0.96)",
            borderColor: "rgba(0,229,255,0.18)",
            borderWidth: 1,
            titleColor: "#00e5ff",
            bodyColor: "#c8d0d8",
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (ctx) => `${ctx.raw} flows`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: "rgba(200,208,216,0.45)",
              font: {
                size: 10,
                family: "'JetBrains Mono', monospace",
              },
              maxTicksLimit: 12,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(255,255,255,0.035)",
            },
            ticks: {
              color: "rgba(200,208,216,0.35)",
              font: { size: 10 },
            },
          },
        },
      },
    });

    return () => chart.current?.destroy();
  }, [labels, bars, loading]);

  if (loading) {
    return (
      <div className="wd-hourly-chart-wrap">
        <div className="wd-empty-cell">Loading chart...</div>
      </div>
    );
  }

  if (!bars.length) {
    return (
      <div className="wd-hourly-chart-wrap">
        <div className="wd-empty-cell">No hourly data available</div>
      </div>
    );
  }

  return (
    <div className="wd-hourly-chart-wrap">
      <canvas ref={ref} />
    </div>
  );
}

function NotifDrawer({ notifications }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const goToFileIn = (notification) => {
    navigate("/fonctionnel/file-in", {
      state: {
        senderReference: notification.senderReference,
      },
    });
  };

  return (
    <div className={`wd-drawer${open ? " open" : ""}`}>
      <button className="wd-drawer-handle" onClick={() => setOpen((o) => !o)}>
        <span>{open ? "CLOSE" : "ALERTS"}</span>
        <span
          style={{
            marginTop: 6,
            background: "#f43f5e",
            borderRadius: 40,
            padding: "2px 6px",
            fontSize: 10,
          }}
        >
          {notifications.length}
        </span>
      </button>

      <div className="wd-drawer-panel">
        <div className="wd-drawer-hd">
          <h4>Alerts</h4>
          <p>Real-time flow intelligence</p>
        </div>

        <div className="wd-notif-list">
          {notifications.length === 0 ? (
            <div className="wd-notif-item info">
              <div className="wd-ntype">System</div>
              <div className="wd-nmsg">No active alerts</div>
            </div>
          ) : (
            notifications.map((n, i) => (
              <div
                key={`${n.ref}-${i}`}
                onClick={() => goToFileIn(n)}
                title="Open filtered File IN list"
                style={{
                  cursor: "pointer",
                  padding: "14px",
                  borderRadius: 18,
                  background: n.bg,
                  border: `1px solid ${n.border}`,
                  marginBottom: 12,
                  transition: ".2s ease",
                }}
              >
                <div
                  style={{
                    color: n.color,
                    fontSize: 11,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                  }}
                >
                  {n.label}
                </div>

                <div
                  style={{
                    color: "var(--t1)",
                    fontSize: 14,
                    fontWeight: 800,
                    marginTop: 6,
                  }}
                >
                  {n.ref}
                </div>

                <div
                  style={{
                    color: "var(--t3)",
                    fontSize: 12,
                    marginTop: 5,
                    lineHeight: 1.5,
                  }}
                >
                  {n.msg}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "var(--t4)", fontSize: 11 }}>
                    {n.time}
                  </span>

                  <span
                    style={{
                      color: n.color,
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    REVIEW →
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ fileInData, fileOutData, loading }) {
  const navigate = useNavigate();

  const cntIn = (key) => fileInData.filter((x) => getStatus(x) === key).length;
  const cntOut = (key) => fileOutData.filter((x) => getStatus(x) === key).length;

  const totalErrIn = FILEIN_ERRORS.reduce((s, x) => s + cntIn(x.key), 0);
  const totalErrOut = FILEOUT_ERRORS.reduce((s, x) => s + cntOut(x.key), 0);

  const goToFileIn = (status) => {
    navigate("/fonctionnel/file-in", {
      state: { status },
    });
  };

  const goToFileOut = (status) => {
    navigate("/fonctionnel/file-out", {
      state: { status },
    });
  };

  const row = (key, label, count, total, type) => {
    if (!count) return null;

    const pct = total ? Math.round((count / total) * 100) : 0;

    return (
      <div
        key={key}
        className="wd-err-row"
        onClick={() => (type === "in" ? goToFileIn(key) : goToFileOut(key))}
      >
        <span className="wd-ename d">{label}</span>

        <div className="wd-etrack">
          <div className="wd-efill d" style={{ width: `${pct}%` }} />
        </div>

        <span className="wd-enum">{count}</span>
        <span className="wd-epct">{pct}%</span>
      </div>
    );
  };

  return (
    <div className="wd-card">
      <div className="wd-hd">
        <div className="wd-title">Root cause analytics</div>
        <span className="wd-tag err">
          {loading ? "—" : totalErrIn + totalErrOut} errors
        </span>
      </div>

      <div className="wd-sec">File IN Errors</div>

      {FILEIN_ERRORS.map(({ key, label }) =>
        row(key, label, cntIn(key), totalErrIn, "in")
      )}

      {totalErrIn === 0 && !loading && (
        <p style={{ fontSize: 11, color: "var(--t4)", padding: "4px 0" }}>
          No File IN errors.
        </p>
      )}

      <div className="wd-sec">File OUT Errors</div>

      {FILEOUT_ERRORS.map(({ key, label }) =>
        row(key, label, cntOut(key), totalErrOut, "out")
      )}

      {totalErrOut === 0 && !loading && (
        <p style={{ fontSize: 11, color: "var(--t4)", padding: "4px 0" }}>
          No File OUT errors.
        </p>
      )}
    </div>
  );
}

function CortexOrb({ fluxData, totalErrors, totalProcessed, loading }) {
  return (
    <div className="wd-cortex-animated">
      <div className="wd-orb-wrap">
        <div className="wd-orb-glow-2" />
        <div className="wd-orb-glow" />
        <div className="wd-orb-ring-outer" />
        <div className="wd-orb-ring-dashed" />
        <div className="wd-plasma-wave" />
        <div className="wd-plasma-wave-2" />

        <div className="wd-data-stream">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="wd-data-particle" />
          ))}
        </div>

        <div className="wd-orb-sphere">
          <div className="wd-orb-scan" />
        </div>

        <div className="wd-orb-eclipse" />
        <div className="wd-orb-corona" />

        <div className="wd-orb-inner">
          <div className="wd-orb-inner-val">
            {loading ? "—" : fluxData.length}
          </div>
          <div className="wd-orb-inner-lbl">FLUX</div>
        </div>
      </div>

      <div className="wd-cortex-name">CURE · CORTEX</div>

      <div className="wd-cortex-status">
        <span className="wd-status-dot" />
        {loading ? "Initializing..." : "Operational · Live"}
      </div>

      <div className="wd-cortex-metrics">
        <div className="wd-cm">
          <div className="wd-cm-val">{loading ? "—" : fluxData.length}</div>
          <div className="wd-cm-lbl">Flux</div>
        </div>

        <div className="wd-cm">
          <div className="wd-cm-val" style={{ color: "#f43f5e" }}>
            {loading ? "—" : totalErrors}
          </div>
          <div className="wd-cm-lbl">Errors</div>
        </div>

        <div className="wd-cm">
          <div className="wd-cm-val" style={{ color: "#10b981" }}>
            {loading ? "—" : totalProcessed}
          </div>
          <div className="wd-cm-lbl">Done</div>
        </div>
      </div>

      <div className="wd-cortex-energy">
        <div className="wd-energy-bar" style={{ width: loading ? "0%" : "100%" }} />
      </div>
    </div>
  );
}

function WaitFunctionalCard({ count, latest, loading, onReview }) {
  const topItems = latest.slice(0, 3);

  return (
    <div
      style={{
        marginTop: 18,
        padding: 16,
        borderRadius: 18,
        border: "1px solid rgba(245,158,11,0.28)",
        background:
          "linear-gradient(135deg, rgba(245,158,11,0.13), rgba(0,229,255,0.04))",
        boxShadow: "0 0 28px rgba(245,158,11,0.07)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              color: "#f59e0b",
              fontSize: 11,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: ".08em",
            }}
          >
            Human validation required
          </div>
          <div
            style={{
              marginTop: 4,
              color: "var(--t1)",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            CBR detected files waiting for functional action
          </div>
        </div>

        <div
          style={{
            minWidth: 74,
            textAlign: "center",
            padding: "10px 12px",
            borderRadius: 16,
            background: "rgba(245,158,11,0.13)",
            border: "1px solid rgba(245,158,11,0.25)",
          }}
        >
          <div
            style={{
              color: "#f59e0b",
              fontSize: 28,
              fontWeight: 900,
              fontFamily: "var(--mono)",
              lineHeight: 1,
            }}
          >
            {loading ? "—" : count}
          </div>
          <div
            style={{
              marginTop: 4,
              color: "var(--t4)",
              fontSize: 9,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: ".08em",
            }}
          >
            pending
          </div>
        </div>
      </div>

      {topItems.length > 0 ? (
        <div style={{ display: "grid", gap: 8 }}>
          {topItems.map((item) => (
            <div
              key={item.ref}
              onClick={() => onReview(item)}
              style={{
                cursor: "pointer",
                padding: "10px 12px",
                borderRadius: 14,
                background: "rgba(3,12,22,0.55)",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 10,
                alignItems: "center",
              }}
              title="Open filtered File IN list"
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: "var(--t1)",
                    fontSize: 12,
                    fontWeight: 800,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.ref}
                </div>
                <div
                  style={{
                    color: "var(--t4)",
                    fontSize: 10,
                    marginTop: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.senderReference || "No sender reference"}
                </div>
              </div>
              <span
                style={{
                  color: "#f59e0b",
                  fontSize: 10,
                  fontWeight: 900,
                  textTransform: "uppercase",
                }}
              >
                Review →
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: "12px 0 2px",
            color: "var(--t4)",
            fontSize: 12,
          }}
        >
          No functional validation required right now.
        </div>
      )}
    </div>
  );
}

export default function FonctionnelDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fluxData, setFluxData] = useState([]);
  const [fileInData, setFileInData] = useState([]);
  const [fileOutData, setFileOutData] = useState([]);
  const [recentFlows, setRecentFlows] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [now, setNow] = useState(new Date());

  const [chartData, setChartData] = useState({
    labels: [],
    bars: [],
    inCounts: [],
    outCounts: [],
    processedCounts: [],
    errorCounts: [],
    waitingCounts: [],
    inProgressCounts: [],
  });

  const [hourlyVolumeData, setHourlyVolumeData] = useState({
    labels: [],
    bars: [],
  });

  const loadData = useCallback(async () => {
    try {
      const [fluxRes, inRes, outRes] = await Promise.all([
        getAllFlux(),
        getAllFileIn(),
        getAllFileOut(),
       
      ]);

      const flux = normalize(fluxRes);
      const fileIn = normalize(inRes);
      const fileOut = normalize(outRes);
     

      setFluxData(flux);
      setFileInData(fileIn);
      setFileOutData(fileOut);
      setRecentFlows(buildRecentActivity(fileIn));
      setNotifications(buildNotifications(fileIn));
      setChartData(buildChartData(fileIn, fileOut));
      setHourlyVolumeData(buildHourlyVolumeData(fileIn, fileOut));
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const iv = setInterval(loadData, 10000);
    return () => clearInterval(iv);
  }, [loadData]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const {
    labels,
    inCounts,
    outCounts,
    processedCounts,
    errorCounts,
    waitingCounts,
    inProgressCounts,
  } = chartData;

  const totalIn = fileInData.length;
  const totalOut = fileOutData.length;

  const totalProcessed =
    fileInData.filter((x) => isOk(getStatus(x))).length +
    fileOutData.filter((x) => isOk(getStatus(x))).length;

  const totalErrors =
    fileInData.filter((x) => isError(getStatus(x))).length +
    fileOutData.filter((x) => isError(getStatus(x))).length;

  const waitFunctionalNotifications = buildNotifications(fileInData);

  const totalWaitFunctional = waitFunctionalNotifications.length;

  const totalWaiting =
    fileInData.filter(
      (x) => isWaiting(getStatus(x)) || getCbrVerdict(x) === "WAITFUNCTIONAL"
    ).length + fileOutData.filter((x) => isWaiting(getStatus(x))).length;

  const totalInProgress = Math.max(
    0,
    fileInData.length +
      fileOutData.length -
      totalProcessed -
      totalErrors -
      totalWaiting
  );

  const successRate = totalOut
    ? Math.round(
        (fileOutData.filter((x) => isOk(getStatus(x))).length / totalOut) * 100
      )
    : 0;

  const errorRate = totalOut
    ? Math.round(
        (fileOutData.filter((x) => isError(getStatus(x))).length / totalOut) *
          100
      )
    : 0;

  const progTotal =
    totalProcessed + totalWaiting + totalErrors + totalInProgress || 1;

  const PROGRESS = [
    { label: "Processed", val: totalProcessed, color: "#10b981" },
    { label: "Errors", val: totalErrors, color: "#f43f5e" },
    { label: "In progress", val: totalInProgress, color: "#6366f1" },
    { label: "Waiting", val: totalWaiting, color: "#f59e0b" },
  ];

  const openWaitFunctionalFileIn = (item) => {
    navigate("/fonctionnel/file-in", {
      state: { senderReference: item?.senderReference || "" },
    });
  };

  const hourlyTotal24 = hourlyVolumeData.bars
    .slice(-24)
    .reduce((a, b) => a + b, 0);

  const hourlyAverage24 =
    hourlyVolumeData.bars.length > 0
      ? Math.round(
          hourlyVolumeData.bars.slice(-24).reduce((a, b) => a + b, 0) /
            Math.min(24, hourlyVolumeData.bars.slice(-24).length)
        )
      : 0;

  const hourlyPeak =
    hourlyVolumeData.bars.length > 0
      ? Math.max(...hourlyVolumeData.bars.slice(-24))
      : 0;

  const hourlyPeakIndex =
    hourlyVolumeData.bars.length > 0
      ? hourlyVolumeData.bars.slice(-24).indexOf(hourlyPeak)
      : -1;

  const hourlyPeakHour =
    hourlyPeakIndex >= 0
      ? hourlyVolumeData.labels.slice(-24)[hourlyPeakIndex]?.split(" ")[1] ||
        "—"
      : "—";

  return (
    <>
      <div className="wd-main">
        <div className="wd-topbar">
          <div>
            <h1>Flow monitoring</h1>
            <p>WORKFLOW-AD · Functional dashboard</p>
          </div>

          <div className="wd-topbar-r">
            <div className="wd-live">
              <div className="wd-dot" />
              Live ·{" "}
              {now.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            <button className="wd-alertbtn">
              <i
                className="ti ti-bell"
                style={{ fontSize: 14, color: "#f43f5e" }}
                aria-hidden="true"
              />
              <span style={{ color: "#f43f5e", fontWeight: 700 }}>
                {notifications.length}
              </span>
              &nbsp;alerts
            </button>

            <div className="wd-avatar">TE</div>
          </div>
        </div>

        <div className="wd-kpis">
          {[
            {
              label: "Total flux",
              val: loading ? "—" : fluxData.length,
              cls: "",
              sub: "All flows monitored",
              icon: "ti-topology-star-3",
            },
            {
              label: "Total errors",
              val: loading ? "—" : totalErrors,
              cls: totalErrors > 0 ? "danger" : "ok",
              sub: "FileIn + FileOut errors",
              icon: "ti-alert-triangle",
            },
            {
              label: "File IN",
              val: loading ? "—" : totalIn,
              cls: "warn",
              sub: "Records received",
              icon: "ti-file-import",
            },
            {
              label: "Processed",
              val: loading ? "—" : totalProcessed,
              cls: "ok",
              sub: "Completed successfully",
              icon: "ti-circle-check",
            },
          ].map((k) => (
            <div key={k.label} className="wd-kpi">
              <div className="wd-kpi-lbl">{k.label}</div>
              <div className={`wd-kpi-val ${k.cls}`}>{k.val}</div>
              <div className="wd-kpi-sub">{k.sub}</div>
              <div className="wd-kpi-ico">
                <i className={`ti ${k.icon}`} aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>

        <div className="wd-mid">
          <div className="wd-card wd-cortex-card">
            <div className="wd-hd">
              <div className="wd-title">CURE · Cortex</div>
              <span className="wd-tag ok">{loading ? "…" : "Operational"}</span>
            </div>

            <CortexOrb
              fluxData={fluxData}
              totalErrors={totalErrors}
              totalProcessed={totalProcessed}
              loading={loading}
            />
          </div>

          <div className="wd-card">
            <div className="wd-hd">
              <div className="wd-title">File IN vs OUT</div>
              <span className="wd-tag info">Live</span>
            </div>

            <div className="wd-legend">
              <span className="wd-leg-item">
                <span className="wd-leg-line" style={{ background: "#6366f1" }} />
                File IN
              </span>

              <span className="wd-leg-item">
                <span
                  className="wd-leg-line"
                  style={{
                    borderTop: "2px dashed #10b981",
                    background: "none",
                    height: 0,
                  }}
                />
                File OUT
              </span>
            </div>

            <div style={{ position: "relative", height: 210 }}>
              {!loading && labels.length ? (
                <LineChartInOut
                  labels={labels}
                  inCounts={inCounts}
                  outCounts={outCounts}
                />
              ) : (
                <div
                  style={{
                    padding: "24px 0",
                    textAlign: "center",
                    color: "var(--t4)",
                    fontSize: 12,
                  }}
                >
                  Loading chart…
                </div>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 8,
                marginTop: 14,
              }}
            >
              {[
                { val: totalIn, lbl: "Total IN", color: "#6366f1" },
                { val: totalOut, lbl: "Total OUT", color: "#10b981" },
                { val: `${successRate}%`, lbl: "Success", color: "var(--t1)" },
                {
                  val: `${errorRate}%`,
                  lbl: "Error rate",
                  color: errorRate > 0 ? "#f43f5e" : "var(--t1)",
                },
              ].map((k) => (
                <div
                  key={k.lbl}
                  style={{
                    textAlign: "center",
                    background: "var(--flat)",
                    borderRadius: "var(--rs)",
                    border: "1px solid var(--border-in)",
                    padding: "10px 6px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      fontFamily: "var(--mono)",
                      color: k.color,
                      lineHeight: 1.1,
                    }}
                  >
                    {k.val}
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".05em",
                      color: "var(--t4)",
                      marginTop: 2,
                    }}
                  >
                    {k.lbl}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="wd-card">
            <div className="wd-hd">
              <div className="wd-title">Flow lifecycle</div>
              <span className="wd-tag ok">Healthy</span>
            </div>

            <div style={{ marginBottom: 14 }}>
              {PROGRESS.map((p) => (
                <div key={p.label} className="wd-prog-row">
                  <div className="wd-prog-lbl">{p.label}</div>

                  <div className="wd-prog-track">
                    <div
                      className="wd-prog-fill"
                      style={{
                        width: `${Math.round((p.val / progTotal) * 100)}%`,
                        background: p.color,
                      }}
                    />
                  </div>

                  <div className="wd-prog-val" style={{ color: p.color }}>
                    {p.val}
                  </div>
                </div>
              ))}
            </div>

            <WaitFunctionalCard
              count={totalWaitFunctional}
              latest={waitFunctionalNotifications}
              loading={loading}
              onReview={openWaitFunctionalFileIn}
            />
          </div>
        </div>

        <div className="wd-bottom">
          <ErrorCard
            fileInData={fileInData}
            fileOutData={fileOutData}
            loading={loading}
          />

          <div className="wd-act-card">
            <div className="wd-act-hd">
              <div className="wd-title">Recent activity</div>
              <span className="wd-tag info">Latest File IN</span>
            </div>

            <div className="wd-table-wrapper wd-table-wrapper-full">
              <table className="wd-table wd-activity-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Description</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="wd-empty-cell">
                        Loading…
                      </td>
                    </tr>
                  ) : recentFlows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="wd-empty-cell">
                        No recent File IN activity
                      </td>
                    </tr>
                  ) : (
                    recentFlows.map((f, index) => (
                      <tr key={`${f.ref}-${index}`}>
                        <td>
                          <span className="wd-ref">{f.ref}</span>
                        </td>

                        <td>
                          <span className={`wd-chip ${chipClass(f.status)}`}>
                            {f.status || "UNKNOWN"}
                          </span>
                        </td>

                        <td className="wd-date-cell">{fmtDate(f.date)}</td>

                        <td className="wd-desc-cell" title={f.description}>
                          {f.description}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="wd-vol-card">
          <div className="wd-hd">
            <div className="wd-title">Hourly volume analytics</div>
            <span className="wd-tag info">Last 24 hours</span>
          </div>

          <div className="wd-hourly-top">
            <div>
              <div className="wd-hourly-big">
                {loading ? "—" : hourlyTotal24}
              </div>

              <div className="wd-hourly-sub">Total processed flows</div>
            </div>

            <div className="wd-hourly-stats">
              <div>
                <span>Peak</span>
                <strong>{loading ? "—" : `${hourlyPeak} · ${hourlyPeakHour}`}</strong>
              </div>

              <div>
                <span>Average</span>
                <strong>{loading ? "—" : hourlyAverage24}</strong>
              </div>
            </div>
          </div>

          <HourlyVolumeChart
            labels={hourlyVolumeData.labels}
            bars={hourlyVolumeData.bars}
            loading={loading}
          />
        </div>
      </div>

      <NotifDrawer notifications={notifications} />
    </>
  );
}