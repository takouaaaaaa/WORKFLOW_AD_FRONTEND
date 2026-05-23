import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import {
  Chart, LineController, LineElement, PointElement,
  BarController, BarElement, LinearScale, CategoryScale,
  Filler, Tooltip, Legend,
} from "chart.js";
import { getAllFlux, getAllFileIn, getAllFileOut } from "../services/dashboardService";

Chart.register(
  LineController, LineElement, PointElement,
  BarController, BarElement, LinearScale, CategoryScale,
  Filler, Tooltip, Legend
);

/* ─── status maps ───────────────────────────────── */
const FILEIN_ERRORS = [
  { key: "PUTINQUEUEFAILED",  label: "Queue failed"    },
  { key: "INBUSINESSERROR",   label: "Business error"  },
  { key: "INTECHNICALERROR",  label: "Technical error" },
  { key: "REJECTED",          label: "Rejected"        },
  { key: "BLOCKED",           label: "Blocked"         },
  { key: "CANCELED",          label: "Canceled"        },
];
const FILEOUT_ERRORS = [
  { key: "ERRORREPORTEDTOSENDER", label: "Error reported" },
  { key: "NACKED",                label: "Nacked"         },
  { key: "REJECTED",              label: "Rejected"       },
  { key: "CANCELED",              label: "Canceled"       },
];
const FILEIN_WAITS = [
  { key: "WAITACTION",  label: "Wait action"  },
  { key: "SUSPENDED",   label: "Suspended"    },
  { key: "INPROCESS",   label: "In process"   },
  { key: "WAITPROCESS", label: "Wait process" },
];
const FILEOUT_WAITS = [
  { key: "WAITTOBESENT",      label: "Wait to be sent" },
  { key: "SENTANDWAITINGACK", label: "Waiting ACK"     },
  { key: "INITIAL",           label: "Initial"         },
];
const OK_STATUSES = ["PROCESSED", "SENT", "ACKED", "SUCCESS"];

/* ─── helpers ───────────────────────────────────── */
function normalize(res) {
  if (Array.isArray(res?.data))          return res.data;
  if (Array.isArray(res?.data?.content)) return res.data.content;
  return [];
}

function getStatus(item) {
  return String(
    item?.status || item?.statusFileIn || item?.statusFileOut ||
    item?.status_file_in || item?.status_file_out || ""
  ).toUpperCase();
}

const isOk      = s => OK_STATUSES.includes(String(s || "").toUpperCase());
const isError   = s => [...FILEIN_ERRORS, ...FILEOUT_ERRORS].map(x => x.key).includes(String(s || "").toUpperCase());
const isWaiting = s => [...FILEIN_WAITS, ...FILEOUT_WAITS].map(x => x.key).includes(String(s || "").toUpperCase());

function classify(s) {
  if (isOk(s))      return "processed";
  if (isError(s))   return "error";
  if (isWaiting(s)) return "waiting";
  return "inProgress";
}

function chipClass(s) {
  const c = classify(s);
  if (c === "processed") return "ok";
  if (c === "error")     return "err";
  if (c === "waiting")   return "warn";
  return "unk";
}

function resolveDate(item) {
  const candidates = [
    item?.updateDate, item?.creationDate, item?.sendingDate,
    item?.settlementDate, item?.createdAt, item?.updatedAt, item?.date,
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
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getRef(item, type) {
  return (
    item?.appReference || item?.appReferenceOut || item?.reference ||
    item?.senderReference ||
    `${type}-${item?.id || item?.idFluxIn || item?.idFluxOut || Math.random()}`
  );
}

function getId(item) {
  return item?.id || item?.idFluxIn || item?.idFluxOut || 0;
}

/* ─── data builders ─────────────────────────────── */
function buildRecentActivity(fileInData, fileOutData) {
  const all = [
    ...fileInData.map(i => ({
      ref: getRef(i, "IN"),  type: "File IN",  status: getStatus(i),
      date: resolveDate(i),  id: getId(i),     rawId: parseInt(getId(i)) || 0,
    })),
    ...fileOutData.map(i => ({
      ref: getRef(i, "OUT"), type: "File OUT", status: getStatus(i),
      date: resolveDate(i),  id: getId(i),     rawId: parseInt(getId(i)) || 0,
    })),
  ];
  return all.sort((a, b) => b.rawId - a.rawId).slice(0, 10);
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
    if (!grouped[label]) grouped[label] = { in: 0, out: 0, processed: 0, error: 0, waiting: 0, inProgress: 0 };
    if (type === "IN") grouped[label].in++; else grouped[label].out++;
    grouped[label][cat]++;
  };
  fileInData.forEach(i => add(i, "IN"));
  fileOutData.forEach(i => add(i, "OUT"));
  const parseFR = l => { const [d, m, y] = l.split("/"); return new Date(`${y}-${m}-${d}`); };
  const labels = Object.keys(grouped).sort((a, b) => parseFR(a) - parseFR(b));
  return {
    labels,
    bars:            labels.map(l => grouped[l].in + grouped[l].out),
    inCounts:        labels.map(l => grouped[l].in),
    outCounts:       labels.map(l => grouped[l].out),
    processedCounts: labels.map(l => grouped[l].processed),
    errorCounts:     labels.map(l => grouped[l].error),
    waitingCounts:   labels.map(l => grouped[l].waiting),
    inProgressCounts:labels.map(l => grouped[l].inProgress),
  };
}

function buildNotifications(fileInData, fileOutData) {
  return [
    ...fileInData.map(x => ({ ...x, sourceType: "File IN" })),
    ...fileOutData.map(x => ({ ...x, sourceType: "File OUT" })),
  ]
    .filter(i => isError(getStatus(i)) || isWaiting(getStatus(i)))
    .slice(0, 8)
    .map(i => {
      const s = getStatus(i);
      return {
        type: isError(s) ? "error" : "warning",
        label: isError(s) ? "Critical Error" : "Pending Action",
        ref: getRef(i, i.sourceType),
        time: fmtDate(resolveDate(i)),
        msg: `${i.sourceType}: ${s}`,
      };
    });
}

/* ─── chart components ──────────────────────────── */
function LineChartInOut({ labels, inCounts, outCounts }) {
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
          { label: "File IN",  data: inCounts,  borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,.06)", borderWidth: 2, fill: true, tension: .4, pointRadius: 3, pointBackgroundColor: "#6366f1" },
          { label: "File OUT", data: outCounts, borderColor: "#10b981", backgroundColor: "rgba(16,185,129,.04)", borderWidth: 2, fill: true, tension: .4, pointRadius: 3, pointBackgroundColor: "#10b981", borderDash: [5, 3] },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { font: { size: 10 }, color: "#b0b8cc" }, grid: { color: "rgba(0,0,0,0.04)" } },
          y: { beginAtZero: true, ticks: { font: { size: 10 }, color: "#b0b8cc" }, grid: { color: "rgba(0,0,0,0.04)" } },
        },
      },
    });
    return () => chart.current?.destroy();
  }, [labels, inCounts, outCounts]);
  return <canvas ref={ref} />;
}

function LineChartLifecycle({ labels, processedCounts, errorCounts, waitingCounts, inProgressCounts }) {
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
          { label: "Processed",   data: processedCounts,   borderColor: "#10b981", borderWidth: 1.5, tension: .4, pointRadius: 2 },
          { label: "Errors",      data: errorCounts,       borderColor: "#f43f5e", borderWidth: 1.5, tension: .4, pointRadius: 2, borderDash: [3, 2] },
          { label: "In progress", data: inProgressCounts,  borderColor: "#6366f1", borderWidth: 1.5, tension: .4, pointRadius: 2, borderDash: [5, 3] },
          { label: "Waiting",     data: waitingCounts,     borderColor: "#f59e0b", borderWidth: 1.5, tension: .4, pointRadius: 2, borderDash: [4, 2] },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { font: { size: 9 }, color: "#b0b8cc" }, grid: { color: "rgba(0,0,0,0.04)" } },
          y: { beginAtZero: true, ticks: { font: { size: 9 }, color: "#b0b8cc" }, grid: { color: "rgba(0,0,0,0.04)" } },
        },
      },
    });
    return () => chart.current?.destroy();
  }, [labels, processedCounts, errorCounts, waitingCounts, inProgressCounts]);
  return <canvas ref={ref} />;
}

function BarChartVolume({ labels, bars }) {
  const ref = useRef(null);
  const chart = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    chart.current?.destroy();
    chart.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Volume", data: bars,
          backgroundColor: bars.map(v => {
            const max = Math.max(...bars, 1);
            return `rgba(99,102,241,${(0.3 + 0.6 * (v / max)).toFixed(2)})`;
          }),
          borderColor: "#6366f1", borderWidth: 1, borderRadius: 6,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { font: { size: 10 }, color: "#b0b8cc" }, grid: { color: "transparent" } },
          y: { beginAtZero: true, ticks: { font: { size: 10 }, color: "#b0b8cc" }, grid: { color: "rgba(0,0,0,0.04)" } },
        },
      },
    });
    return () => chart.current?.destroy();
  }, [labels, bars]);
  return <canvas ref={ref} />;
}

/* ─── notification drawer ───────────────────────── */
function NotifDrawer({ notifications }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`wd-drawer${open ? " open" : ""}`}>
      <button className="wd-drawer-handle" onClick={() => setOpen(o => !o)}>
        <span>{open ? "CLOSE" : "ALERTS"}</span>
        <span style={{ marginTop: 6, background: "#f43f5e", borderRadius: 40, padding: "2px 6px", fontSize: 10 }}>
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
          ) : notifications.map((n, i) => (
            <div key={i} className={`wd-notif-item ${n.type}`}>
              <div className="wd-ntype">{n.label}</div>
              <div className="wd-nmsg">{n.msg}</div>
              <div className="wd-nref">{n.ref}</div>
              <div className="wd-ntime">{n.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── error analysis ────────────────────────────── */
function ErrorCard({ fileInData, fileOutData, loading }) {
  const navigate = useNavigate();
  const cntIn  = key => fileInData.filter(x => getStatus(x) === key).length;
  const cntOut = key => fileOutData.filter(x => getStatus(x) === key).length;

  const totalErrIn  = FILEIN_ERRORS.reduce((s, x) => s + cntIn(x.key), 0);
  const totalErrOut = FILEOUT_ERRORS.reduce((s, x) => s + cntOut(x.key), 0);
  const totalWaitIn  = FILEIN_WAITS.reduce((s, x) => s + cntIn(x.key), 0);
  const totalWaitOut = FILEOUT_WAITS.reduce((s, x) => s + cntOut(x.key), 0);
  const totalErr     = totalErrIn + totalErrOut;
  const totalWait    = totalWaitIn + totalWaitOut;
  const totalHealthy =
    fileInData.filter(x => isOk(getStatus(x))).length +
    fileOutData.filter(x => isOk(getStatus(x))).length;

  const maxErr  = Math.max(...FILEIN_ERRORS.map(s => cntIn(s.key)), ...FILEOUT_ERRORS.map(s => cntOut(s.key)), 1);
  const maxWait = Math.max(...FILEIN_WAITS.map(s => cntIn(s.key)), ...FILEOUT_WAITS.map(s => cntOut(s.key)), 1);

  const row = (key, label, count, total, max, kind, route) => {
    if (!count) return null;
    const pct = total ? Math.round((count / total) * 100) : 0;
    const bar = Math.round((count / max) * 100);
    return (
      <div key={key} className="wd-err-row" onClick={() => navigate(route, { state: { status: key } })}>
        <span className={`wd-ename ${kind}`}>{label}</span>
        <div className="wd-etrack"><div className={`wd-efill ${kind}`} style={{ width: `${bar}%` }} /></div>
        <span className="wd-enum">{count}</span>
        <span className="wd-epct">{pct}%</span>
      </div>
    );
  };

  return (
    <div className="wd-card">
      <div className="wd-hd">
        <div className="wd-title">Root cause analytics</div>
        <span className={`wd-tag ${totalErr > 0 ? "err" : "ok"}`}>{loading ? "—" : totalErr} errors</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Critical errors", val: totalErr,     color: "#f43f5e" },
          { label: "Pending review",  val: totalWait,    color: "#f59e0b" },
          { label: "Healthy flows",   val: totalHealthy, color: "#10b981" },
        ].map(m => (
          <div key={m.label} style={{ textAlign: "center", padding: "14px 8px", background: "var(--flat)", borderRadius: "var(--rs)", border: "1px solid var(--border-in)" }}>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--mono)", color: m.color, marginBottom: 3 }}>{loading ? "—" : m.val}</div>
            <div style={{ fontSize: 11, color: "var(--t4)" }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="wd-sec">Error breakdown — File IN</div>
      {FILEIN_ERRORS.map(({ key, label }) => row(key, label, cntIn(key), totalErr, maxErr, "d", "/fonctionnel/file-in"))}
      {totalErrIn === 0 && !loading && <p style={{ fontSize: 11, color: "var(--t4)", padding: "4px 0" }}>No errors in File IN.</p>}

      <div className="wd-sec">Error breakdown — File OUT</div>
      {FILEOUT_ERRORS.map(({ key, label }) => row(key, label, cntOut(key), totalErr, maxErr, "d", "/fonctionnel/file-out"))}
      {totalErrOut === 0 && !loading && <p style={{ fontSize: 11, color: "var(--t4)", padding: "4px 0" }}>No errors in File OUT.</p>}

      <div className="wd-sec">Awaiting resolution — File IN</div>
      {FILEIN_WAITS.map(({ key, label }) => row(key, label, cntIn(key), totalWait, maxWait, "w", "/fonctionnel/file-in"))}
      {totalWaitIn === 0 && !loading && <p style={{ fontSize: 11, color: "var(--t4)", padding: "4px 0" }}>No pending in File IN.</p>}

      <div className="wd-sec">Awaiting resolution — File OUT</div>
      {FILEOUT_WAITS.map(({ key, label }) => row(key, label, cntOut(key), totalWait, maxWait, "w", "/fonctionnel/file-out"))}
      {totalWaitOut === 0 && !loading && <p style={{ fontSize: 11, color: "var(--t4)", padding: "4px 0" }}>No pending in File OUT.</p>}
    </div>
  );
}

/* ─── Cyan particle-grid orb (replaces AnimatedCortex) ── */
function CortexOrb({ fluxData, totalErrors, totalProcessed, loading }) {
  return (
    <div className="wd-cortex-animated">
      {/* Orb */}
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
        {/* Core sphere */}
        <div className="wd-orb-sphere">
          <div className="wd-orb-scan" />
        </div>
        {/* Eclipse halo */}
        <div className="wd-orb-eclipse" />
        <div className="wd-orb-corona" />
        {/* Metrics inside orb */}
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
          <div className="wd-cm-val" style={{ color: "#f43f5e" }}>{loading ? "—" : totalErrors}</div>
          <div className="wd-cm-lbl">Errors</div>
        </div>
        <div className="wd-cm">
          <div className="wd-cm-val" style={{ color: "#10b981" }}>{loading ? "—" : totalProcessed}</div>
          <div className="wd-cm-lbl">Done</div>
        </div>
      </div>

      <div className="wd-cortex-energy">
        <div className="wd-energy-bar" style={{ width: loading ? "0%" : "100%" }} />
      </div>
    </div>
  );
}

/* ─── main dashboard ────────────────────────────── */
export default function FonctionnelDashboard() {
  const [loading, setLoading] = useState(true);
  const [fluxData, setFluxData] = useState([]);
  const [fileInData, setFileInData] = useState([]);
  const [fileOutData, setFileOutData] = useState([]);
  const [recentFlows, setRecentFlows] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [], bars: [], inCounts: [], outCounts: [],
    processedCounts: [], errorCounts: [], waitingCounts: [], inProgressCounts: [],
  });
  const [now, setNow] = useState(new Date());

  const loadData = useCallback(async () => {
    try {
      const [fluxRes, inRes, outRes] = await Promise.all([
        getAllFlux(), getAllFileIn(), getAllFileOut(),
      ]);
      const flux   = normalize(fluxRes);
      const fileIn  = normalize(inRes);
      const fileOut = normalize(outRes);
      setFluxData(flux);
      setFileInData(fileIn);
      setFileOutData(fileOut);
      setRecentFlows(buildRecentActivity(fileIn, fileOut));
      setNotifications(buildNotifications(fileIn, fileOut));
      setChartData(buildChartData(fileIn, fileOut));
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const iv = setInterval(loadData, 30000);
    return () => clearInterval(iv);
  }, [loadData]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const { labels, bars, inCounts, outCounts, processedCounts, errorCounts, waitingCounts, inProgressCounts } = chartData;

  const totalIn  = fileInData.length;
  const totalOut = fileOutData.length;
  const totalProcessed =
    fileInData.filter(x => isOk(getStatus(x))).length +
    fileOutData.filter(x => isOk(getStatus(x))).length;
  const totalErrors =
    fileInData.filter(x => isError(getStatus(x))).length +
    fileOutData.filter(x => isError(getStatus(x))).length;
  const totalWaiting =
    fileInData.filter(x => isWaiting(getStatus(x))).length +
    fileOutData.filter(x => isWaiting(getStatus(x))).length;
  const totalInProgress = Math.max(0,
    fileInData.length + fileOutData.length - totalProcessed - totalErrors - totalWaiting
  );
  const successRate = totalOut ? Math.round((fileOutData.filter(x => isOk(getStatus(x))).length / totalOut) * 100) : 0;
  const errorRate   = totalOut ? Math.round((fileOutData.filter(x => isError(getStatus(x))).length / totalOut) * 100) : 0;
  const progTotal   = totalProcessed + totalWaiting + totalErrors + totalInProgress || 1;

  const PROGRESS = [
    { label: "Processed",   val: totalProcessed,  color: "#10b981" },
    { label: "Errors",      val: totalErrors,      color: "#f43f5e" },
    { label: "In progress", val: totalInProgress,  color: "#6366f1" },
    { label: "Waiting",     val: totalWaiting,     color: "#f59e0b" },
  ];

  return (
    <>
      <div className="wd-main">
        {/* ── Topbar ── */}
        <div className="wd-topbar">
          <div>
            <h1>Flow monitoring</h1>
            <p>WORKFLOW-AD · Fonctionnel dashboard</p>
          </div>
          <div className="wd-topbar-r">
            <div className="wd-live">
              <div className="wd-dot" />
              Live · {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <button className="wd-alertbtn">
              <i className="ti ti-bell" style={{ fontSize: 14, color: "#f43f5e" }} aria-hidden="true" />
              <span style={{ color: "#f43f5e", fontWeight: 700 }}>{notifications.length}</span>&nbsp;alerts
            </button>
            <div className="wd-avatar">TE</div>
          </div>
        </div>

        {/* ── KPI cards ── */}
        <div className="wd-kpis">
          {[
            { label: "Total flux",    val: loading ? "—" : fluxData.length, cls: "",                              sub: "All flows monitored",    icon: "ti-topology-star-3" },
            { label: "Total errors",  val: loading ? "—" : totalErrors,     cls: totalErrors > 0 ? "danger" : "ok", sub: "FileIn + FileOut errors", icon: "ti-alert-triangle"  },
            { label: "File IN",       val: loading ? "—" : totalIn,         cls: "warn",                          sub: "Records received",       icon: "ti-file-import"     },
            { label: "Processed",     val: loading ? "—" : totalProcessed,  cls: "ok",                            sub: "Completed successfully", icon: "ti-circle-check"    },
          ].map(k => (
            <div key={k.label} className="wd-kpi">
              <div className="wd-kpi-lbl">{k.label}</div>
              <div className={`wd-kpi-val ${k.cls}`}>{k.val}</div>
              <div className="wd-kpi-sub">{k.sub}</div>
              <div className="wd-kpi-ico"><i className={`ti ${k.icon}`} aria-hidden="true" /></div>
            </div>
          ))}
        </div>

        {/* ── Mid row: Cortex + Charts ── */}
        <div className="wd-mid">
          {/* Cortex panel */}
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

          {/* File IN vs OUT */}
          <div className="wd-card">
            <div className="wd-hd">
              <div className="wd-title">File IN vs OUT</div>
              <span className="wd-tag info">Live</span>
            </div>
            <div className="wd-legend">
              <span className="wd-leg-item"><span className="wd-leg-line" style={{ background: "#6366f1" }} />File IN</span>
              <span className="wd-leg-item"><span className="wd-leg-line" style={{ borderTop: "2px dashed #10b981", background: "none", height: 0 }} />File OUT</span>
            </div>
            <div style={{ position: "relative", height: 148 }}>
              {!loading && labels.length
                ? <LineChartInOut labels={labels} inCounts={inCounts} outCounts={outCounts} />
                : <div style={{ padding: "24px 0", textAlign: "center", color: "var(--t4)", fontSize: 12 }}>Loading chart…</div>
              }
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 14 }}>
              {[
                { val: totalIn,          lbl: "Total IN",  color: "#6366f1"                               },
                { val: totalOut,         lbl: "Total OUT", color: "#10b981"                               },
                { val: `${successRate}%`,lbl: "Success",   color: "var(--t1)"                             },
                { val: `${errorRate}%`,  lbl: "Error rate",color: errorRate > 0 ? "#f43f5e" : "var(--t1)"},
              ].map(k => (
                <div key={k.lbl} style={{ textAlign: "center", background: "var(--flat)", borderRadius: "var(--rs)", border: "1px solid var(--border-in)", padding: "10px 6px" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--mono)", color: k.color, lineHeight: 1.1 }}>{k.val}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--t4)", marginTop: 2 }}>{k.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Flow lifecycle */}
          <div className="wd-card">
            <div className="wd-hd">
              <div className="wd-title">Flow lifecycle</div>
              <span className="wd-tag ok">Healthy</span>
            </div>
            <div style={{ marginBottom: 14 }}>
              {PROGRESS.map(p => (
                <div key={p.label} className="wd-prog-row">
                  <div className="wd-prog-lbl">{p.label}</div>
                  <div className="wd-prog-track">
                    <div className="wd-prog-fill" style={{ width: `${Math.round((p.val / progTotal) * 100)}%`, background: p.color }} />
                  </div>
                  <div className="wd-prog-val" style={{ color: p.color }}>{p.val}</div>
                </div>
              ))}
            </div>
            <div style={{ position: "relative", height: 110 }}>
              {!loading && labels.length
                ? <LineChartLifecycle labels={labels} processedCounts={processedCounts} errorCounts={errorCounts} waitingCounts={waitingCounts} inProgressCounts={inProgressCounts} />
                : <div style={{ padding: "16px 0", textAlign: "center", color: "var(--t4)", fontSize: 12 }}>Loading…</div>
              }
            </div>
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className="wd-bottom">
          <ErrorCard fileInData={fileInData} fileOutData={fileOutData} loading={loading} />

          <div className="wd-act-card">
            <div className="wd-act-hd">
              <div className="wd-title">Recent activity</div>
              <span className="wd-tag info">Latest by ID</span>
            </div>
            <div className="wd-table-wrapper">
              <table className="wd-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Reference</th><th>Type</th><th>Status</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--t4)", padding: "24px 0" }}>Loading…</td></tr>
                  ) : recentFlows.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--t4)", padding: "24px 0" }}>No recent flows</td></tr>
                  ) : recentFlows.map((f, i) => (
                    <tr key={`${f.ref}-${i}`} className={i === 0 ? "wd-latest-row" : ""}>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: "var(--brand)" }}>#{f.id}</td>
                      <td>
                        <span className="wd-ref">{String(f.ref).slice(0, 18)}</span>
                        {i === 0 && <span className="wd-latest-badge">Latest</span>}
                      </td>
                      <td style={{ color: "var(--t3)", fontSize: 11 }}>{f.type}</td>
                      <td><span className={`wd-chip ${chipClass(f.status)}`}>{f.status || "—"}</span></td>
                      <td style={{ fontSize: 11, color: "var(--t4)" }}>{fmtDate(f.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Daily volume ── */}
        <div className="wd-vol-card">
          <div className="wd-hd">
            <div className="wd-title">Daily volume trend</div>
            <span className="wd-tag info">{labels.length} days</span>
          </div>
          <div style={{ position: "relative", height: 110 }}>
            {!loading && bars.length
              ? <BarChartVolume labels={labels} bars={bars} />
              : <div style={{ padding: "16px 0", textAlign: "center", color: "var(--t4)", fontSize: 12 }}>No data available</div>
            }
          </div>
        </div>
      </div>

      <NotifDrawer notifications={notifications} />
    </>
  );
}