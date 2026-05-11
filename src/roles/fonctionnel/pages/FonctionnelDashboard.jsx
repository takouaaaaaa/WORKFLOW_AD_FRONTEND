import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import {
  Chart, LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip, Legend,
} from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

import { getAllFlux, getAllFileIn, getAllFileOut } from "../services/dashboardService";

const STATUS_GROUPS = {
  ok:     ["PROCESSED", "SENT", "ACKED", "SUCCESS"],
  danger: ["ERRORREPORTEDTOSENDER","ERROR","FAILED","BLOCKED","REJECTED","CANCELED","INBUSINESSERROR","NOCONTRACTFOUND","INTECHNICALERROR","INITIATIONFAILED","PUTINQUEUEFAILED"],
  warn:   ["INPROCESS","WAITACTION","INITIATED","WAIT","QUEUE","SUSPENDED"],
};

const ERROR_STATUSES = [
  { key: "ERRORREPORTEDTOSENDER", label: "Error reported" },
  { key: "BLOCKED",               label: "Blocked" },
  { key: "INBUSINESSERROR",       label: "Business error" },
  { key: "NOCONTRACTFOUND",       label: "No contract" },
  { key: "REJECTED",              label: "Rejected" },
  { key: "INTECHNICALERROR",      label: "Technical error" },
];
const WARN_STATUSES = [
  { key: "WAITACTION", label: "Awaiting action" },
  { key: "SUSPENDED",  label: "Suspended" },
  { key: "CANCELED",   label: "Canceled" },
];

function getBadgeClass(status) {
  const s = (status || "").toUpperCase();
  if (STATUS_GROUPS.danger.some((k) => s.includes(k))) return "danger";
  if (STATUS_GROUPS.ok.some((k) => s === k))           return "ok";
  if (STATUS_GROUPS.warn.some((k) => s.includes(k)))   return "warn";
  return "unknown";
}

function classifyStatus(status) {
  const s = (status || "").toUpperCase();
  if (STATUS_GROUPS.danger.some((k) => s.includes(k))) return "error";
  if (STATUS_GROUPS.ok.some((k) => s === k))           return "processed";
  if (STATUS_GROUPS.warn.some((k) => s.includes(k)))   return "waiting";
  return "inProgress";
}

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function resolveDate(item, type) {
  const candidates = type === "fileOut"
    ? [item?.updateDate, item?.creationDate]
    : [item?.sendingDate, item?.settlementDate, item?.creationDate];
  for (const d of candidates)
    if (d && !isNaN(new Date(d).getTime())) return d;
  return null;
}

function enrichFluxData(fluxData, fileInData, fileOutData) {
  const fileInMap  = new Map(fileInData.map((i)  => [i?.appReference, i]));
  const fileOutMap = new Map(fileOutData.map((i) => [i?.appReferenceOut, i]));
  return fluxData.map((flux) => {
    const ref     = flux?.appReference;
    const fileIn  = ref ? fileInMap.get(ref)  : undefined;
    const fileOut = ref ? fileOutMap.get(ref) : undefined;
    const mergedStatus = flux?.status || fileIn?.status || fileOut?.status || null;
    const mergedDate =
      resolveDate(fileOut, "fileOut") || resolveDate(fileIn, "fileIn") ||
      flux?.updateDate || flux?.creationDate || null;
    return { ...flux, mergedStatus, mergedDate };
  });
}

function buildNotifications(fileOutData, fileInData) {
  const notifs = [];
  fileOutData
    .filter((i) => STATUS_GROUPS.danger.some((s) => (i?.status || "").toUpperCase().includes(s)))
    .slice(0, 4)
    .forEach((i) => notifs.push({
      type: "error", label: "Critical Error", ref: i?.appReferenceOut,
      time: formatDate(resolveDate(i, "fileOut")),
      msg: `FileOut failure: ${i?.status || "unknown error"}`,
    }));
  fileInData
    .filter((i) => STATUS_GROUPS.ok.some((s) => (i?.status || "").toUpperCase() === s))
    .slice(0, 2)
    .forEach((i) => notifs.push({
      type: "success", label: "Flow Completed", ref: i?.appReference,
      time: formatDate(resolveDate(i, "fileIn")),
      msg: `Processed successfully: ${i?.status}`,
    }));
  fileInData
    .filter((i) => STATUS_GROUPS.warn.some((s) => (i?.status || "").toUpperCase().includes(s)))
    .slice(0, 2)
    .forEach((i) => notifs.push({
      type: "warning", label: "Pending Action", ref: i?.appReference,
      time: formatDate(resolveDate(i, "fileIn")),
      msg: `Flow pending: ${i?.status}`,
    }));
  return notifs.slice(0, 6);
}

function buildChartData(fluxData, fileInData, fileOutData) {
  const groupByDay = (items, getDate, getStatus) => {
    const grouped = {};
    items.forEach((item) => {
      const raw = getDate(item);
      if (!raw) return;
      const date = new Date(raw);
      if (isNaN(date.getTime())) return;
      const label = date.toLocaleDateString("fr-FR");
      if (!grouped[label]) grouped[label] = { total:0, processed:0, error:0, waiting:0, inProgress:0 };
      grouped[label].total++;
      if (getStatus) {
        const cat = classifyStatus(getStatus(item));
        if      (cat === "processed") grouped[label].processed++;
        else if (cat === "error")     grouped[label].error++;
        else if (cat === "waiting")   grouped[label].waiting++;
        else                          grouped[label].inProgress++;
      }
    });
    return grouped;
  };
  const fileInGrouped  = groupByDay(fileInData,  (i) => resolveDate(i, "fileIn"));
  const fileOutGrouped = groupByDay(fileOutData, (i) => resolveDate(i, "fileOut"), (i) => i?.status);
  const fluxGrouped    = groupByDay(fluxData, (i) => i?.mergedDate || i?.updateDate || i?.creationDate, (i) => i?.mergedStatus || i?.status);
  const parseFR = (l) => { const [d,m,y] = l.split("/"); return new Date(`${y}-${m}-${d}`); };
  const labels = Array.from(new Set([
    ...Object.keys(fileInGrouped), ...Object.keys(fileOutGrouped), ...Object.keys(fluxGrouped),
  ])).sort((a,b) => parseFR(a) - parseFR(b));
  return {
    labels,
    bars:             labels.map((l) => fluxGrouped[l]?.total       || 0),
    inCounts:         labels.map((l) => fileInGrouped[l]?.total     || 0),
    outCounts:        labels.map((l) => fileOutGrouped[l]?.total    || 0),
    processedCounts:  labels.map((l) => fluxGrouped[l]?.processed   || 0),
    errorCounts:      labels.map((l) => fluxGrouped[l]?.error       || 0),
    waitingCounts:    labels.map((l) => fluxGrouped[l]?.waiting     || 0),
    inProgressCounts: labels.map((l) => fluxGrouped[l]?.inProgress  || 0),
  };
}

function FileInOutChart({ labels, inCounts, outCounts }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label:"File IN",  data:inCounts,  borderColor:"#5B4EE8", backgroundColor:"rgba(91,78,232,0.07)", borderWidth:2, fill:true, tension:0.4, pointRadius:2.5, pointBackgroundColor:"#5B4EE8" },
          { label:"File OUT", data:outCounts, borderColor:"#1A9E6E", backgroundColor:"rgba(26,158,110,0.05)", borderWidth:2, fill:true, tension:0.4, pointRadius:2.5, pointBackgroundColor:"#1A9E6E" },
        ],
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins: { legend:{display:false}, tooltip:{backgroundColor:"#16161E",titleColor:"#fff",bodyColor:"#aaa",padding:10,cornerRadius:8} },
        scales: {
          x: { ticks:{font:{size:10},color:"#8A8A9A"}, grid:{color:"rgba(0,0,0,0.04)"} },
          y: { beginAtZero:true, ticks:{font:{size:10},color:"#8A8A9A"}, grid:{color:"rgba(0,0,0,0.04)"} },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [labels, inCounts, outCounts]);
  return <canvas ref={canvasRef} />;
}

function FluxAvancementChart({ labels, processedCounts, errorCounts, waitingCounts, inProgressCounts }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label:"Processed",   data:processedCounts,  borderColor:"#1A9E6E", borderWidth:2, tension:0.4, pointRadius:2 },
          { label:"Waiting",     data:waitingCounts,    borderColor:"#C47D18", borderWidth:2, tension:0.4, pointRadius:2 },
          { label:"Errors",      data:errorCounts,      borderColor:"#D63F3F", borderWidth:2, tension:0.4, pointRadius:2 },
          { label:"In progress", data:inProgressCounts, borderColor:"#5B4EE8", borderWidth:2, tension:0.4, pointRadius:2 },
        ],
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins: { legend:{display:false}, tooltip:{backgroundColor:"#16161E",titleColor:"#fff",bodyColor:"#aaa",padding:10,cornerRadius:8} },
        scales: {
          x: { ticks:{font:{size:10},color:"#8A8A9A"}, grid:{color:"rgba(0,0,0,0.04)"} },
          y: { beginAtZero:true, ticks:{font:{size:10},color:"#8A8A9A"}, grid:{color:"rgba(0,0,0,0.04)"} },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [labels, processedCounts, errorCounts, waitingCounts, inProgressCounts]);
  return <canvas ref={canvasRef} />;
}

function NotificationPanel({ notifications }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`palm-notif-drawer ${open ? "open" : ""}`}>
      <button className="palm-notif-handle" onClick={() => setOpen(!open)}>
        <span>{open ? "CLOSE" : "ALERTS"}</span>
        <span style={{ marginTop:6, background:"#D63F3F", borderRadius:40, padding:"2px 6px", fontSize:10 }}>
          {notifications.length}
        </span>
      </button>
      <div className="palm-notif-panel">
        <div className="palm-notif-header">
          <div className="palm-notif-title">Alerts</div>
          <div className="palm-notif-subtitle">Real-time flow intelligence</div>
        </div>
        <div className="palm-notif-list">
          {notifications.length === 0 ? (
            <div className="palm-notif-item info">
              <div className="palm-notif-type">System Idle</div>
              <div className="palm-notif-msg">No active alerts</div>
            </div>
          ) : notifications.map((n, i) => (
            <div key={i} className={`palm-notif-item ${n.type}`}>
              <div className="palm-notif-type">{n.label}</div>
              <div className="palm-notif-msg">{n.msg}</div>
              {n.ref  && <div className="palm-notif-ref">{n.ref}</div>}
              {n.time && <div className="palm-notif-time">{n.time}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorAnalysisCard({ fluxData, loading }) {
  const navigate = useNavigate();
  const countByStatus = (k) => fluxData.filter((f) => (f?.status || "").toUpperCase() === k).length;
  const totalErrors = ERROR_STATUSES.reduce((s, e) => s + countByStatus(e.key), 0);
  const totalWarn   = WARN_STATUSES.reduce((s, w)  => s + countByStatus(w.key), 0);
  const maxError    = Math.max(...ERROR_STATUSES.map((e) => countByStatus(e.key)), 1);
  const maxWarn     = Math.max(...WARN_STATUSES.map((w)  => countByStatus(w.key)), 1);
  const goToFileIn  = (e, key) => { e.preventDefault(); e.stopPropagation(); navigate("/fonctionnel/file-in",  { state: { status: key } }); };
  const goToFileOut = (e, key) => { e.preventDefault(); e.stopPropagation(); navigate("/fonctionnel/file-out", { state: { status: key } }); };

  return (
    <div className="palm-error-card">
      <div className="palm-card-title">Root cause analytics</div>
      <div className="palm-error-metrics">
        <div className="palm-error-metric">
          <div className="palm-error-metric-val danger">{loading ? "—" : totalErrors}</div>
          <div style={{fontSize:12,color:"#8A8A9A",marginTop:4}}>Critical errors</div>
        </div>
        <div className="palm-error-metric">
          <div className="palm-error-metric-val warn">{loading ? "—" : totalWarn}</div>
          <div style={{fontSize:12,color:"#8A8A9A",marginTop:4}}>Pending review</div>
        </div>
        <div className="palm-error-metric">
          <div className="palm-error-metric-val ok">{loading ? "—" : fluxData.length - totalErrors - totalWarn}</div>
          <div style={{fontSize:12,color:"#8A8A9A",marginTop:4}}>Healthy flows</div>
        </div>
      </div>

      <div className="palm-error-section-label">Error breakdown — File IN</div>
      {ERROR_STATUSES.map(({ key, label }) => {
        const cnt = countByStatus(key);
        if (!cnt) return null;
        const pct = totalErrors ? Math.round((cnt / totalErrors) * 100) : 0;
        const bar = Math.round((cnt / maxError) * 100);
        return (
          <div key={key} className="palm-error-row" onClick={(e) => goToFileIn(e, key)}>
            <span className="palm-error-badge danger">{label}</span>
            <div className="palm-error-bar-bg"><div className="palm-error-bar-fill danger" style={{ width:`${bar}%` }} /></div>
            <span className="palm-error-count">{cnt}</span>
            <span className="palm-error-pct">{pct}%</span>
            <span className="palm-error-arrow">→</span>
          </div>
        );
      })}
      {totalErrors === 0 && !loading && <p style={{fontSize:12,color:"#8A8A9A",padding:"8px 0"}}>No critical errors.</p>}

      <div className="palm-error-section-label" style={{marginTop:20}}>Awaiting resolution — File OUT</div>
      {WARN_STATUSES.map(({ key, label }) => {
        const cnt = countByStatus(key);
        if (!cnt) return null;
        const pct = totalWarn ? Math.round((cnt / totalWarn) * 100) : 0;
        const bar = Math.round((cnt / maxWarn) * 100);
        return (
          <div key={key} className="palm-error-row" onClick={(e) => goToFileOut(e, key)}>
            <span className="palm-error-badge warn">{label}</span>
            <div className="palm-error-bar-bg"><div className="palm-error-bar-fill warn" style={{ width:`${bar}%` }} /></div>
            <span className="palm-error-count">{cnt}</span>
            <span className="palm-error-pct">{pct}%</span>
            <span className="palm-error-arrow">→</span>
          </div>
        );
      })}
      {totalWarn === 0 && !loading && <p style={{fontSize:12,color:"#8A8A9A",padding:"8px 0"}}>No pending flows.</p>}
    </div>
  );
}

export default function FonctionnelDashboard() {
  const [loading,     setLoading]     = useState(true);
  const [rawFluxData, setRawFluxData] = useState([]);
  const [stats,       setStats]       = useState({ synthese:0, jobsEnErreur:0, aiProcessed:0, totalFileIn:0 });
  const [recentFlows,   setRecentFlows]   = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chartData,     setChartData]     = useState({
    labels:[], bars:[], inCounts:[], outCounts:[],
    processedCounts:[], errorCounts:[], waitingCounts:[], inProgressCounts:[],
  });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const { labels, bars, inCounts, outCounts, processedCounts, errorCounts, waitingCounts, inProgressCounts } = chartData;
  const totalIn         = inCounts.reduce((a,b) => a+b, 0);
  const totalOut        = outCounts.reduce((a,b) => a+b, 0);
  const totalProcessed  = processedCounts.reduce((a,b) => a+b, 0);
  const totalErrors     = errorCounts.reduce((a,b) => a+b, 0);
  const totalWaiting    = waitingCounts.reduce((a,b) => a+b, 0);
  const totalInProgress = inProgressCounts.reduce((a,b) => a+b, 0);
  const successRate     = totalOut ? Math.round((totalProcessed / totalOut) * 100) : null;
  const errorRate       = totalOut ? Math.round((totalErrors / totalOut) * 100)    : null;

  const processAndSet = useCallback((fluxRes, fileInRes, fileOutRes) => {
    const fluxData    = fluxRes?.data    || [];
    const fileInData  = fileInRes?.data  || [];
    const fileOutData = fileOutRes?.data || [];
    const enriched = enrichFluxData(fluxData, fileInData, fileOutData);
    const jobsErr     = fileOutData.filter((i) => STATUS_GROUPS.danger.some((s) => (i?.status || "").toUpperCase().includes(s))).length;
    const processedIn = fileInData.filter((i)  => STATUS_GROUPS.ok.some((s) => (i?.status || "").toUpperCase() === s)).length;
    setRawFluxData(fluxData);
    setStats({ synthese:fluxData.length, jobsEnErreur:jobsErr, aiProcessed:processedIn, totalFileIn:fileInData.length });
    setRecentFlows([...enriched].filter((f) => f.mergedDate).sort((a,b) => new Date(b.mergedDate) - new Date(a.mergedDate)).slice(0,6));
    setNotifications(buildNotifications(fileOutData, fileInData));
    setChartData(buildChartData(enriched, fileInData, fileOutData));
    setLoading(false);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [fluxRes, inRes, outRes] = await Promise.all([getAllFlux(), getAllFileIn(), getAllFileOut()]);
      processAndSet(fluxRes, inRes, outRes);
    } catch (e) { console.error(e); setLoading(false); }
  }, [processAndSet]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      getAllFlux().then((f) => getAllFileIn().then((i) => getAllFileOut().then((o) => processAndSet(f,i,o)))).catch(()=>{});
    }, 30000);
    return () => clearInterval(interval);
  }, [loadData, processAndSet]);

  const STATS = [
    { label: "Total flux",    value: loading ? "—" : stats.synthese,     cls: "warn",                                    sub: "All flows monitored",  icon: "⬡" },
    { label: "Jobs in error", value: loading ? "—" : stats.jobsEnErreur, cls: stats.jobsEnErreur > 0 ? "danger" : "ok", sub: "FileOut failures",      icon: "⚠" },
    { label: "File IN",       value: loading ? "—" : stats.totalFileIn,  cls: "warn",                                    sub: "Records received",      icon: "↙" },
    { label: "Processed",     value: loading ? "—" : stats.aiProcessed,  cls: "ok",                                      sub: "Completed successfully", icon: "✓" },
  ];

  const PROGRESS = [
    { lbl:"Processed",   val:totalProcessed,  color:"#1A9E6E" },
    { lbl:"Waiting",     val:totalWaiting,    color:"#C47D18" },
    { lbl:"Errors",      val:totalErrors,     color:"#D63F3F" },
    { lbl:"In progress", val:totalInProgress, color:"#5B4EE8" },
  ];
  const progTotal = totalProcessed + totalWaiting + totalErrors + totalInProgress || 1;

  return (
    <>
      <div className="palm-main">

        {/* ── PAGE HEADER ── */}
        <div className="palm-page-header">
          <div>
            <div className="palm-page-title">Fonctionnel dashboard</div>
            <div className="palm-page-sub">Flow monitoring & analytics</div>
          </div>
          <div className="palm-page-time">
            <span className="palm-live-dot" />
            Live · {now.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" })}
          </div>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="palm-stat-row">
          {STATS.map((s) => (
            <div key={s.label} className="palm-stat-card">
              <div className="palm-stat-icon">{s.icon}</div>
              <div className="palm-stat-label">{s.label}</div>
              <div className={`palm-stat-value ${s.cls}`}>{s.value}</div>
              <div className="palm-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── CENTER: status panel + recent activity ── */}
        <div className="palm-center-grid">

          {/* Left: compact status panel */}
          <div className="palm-status-panel">
            <div className="palm-status-header">
              <div className="palm-status-title">CURE · Cortex</div>
              <div className="palm-status-badge">
                <span style={{width:5,height:5,borderRadius:"50%",background:"#1A9E6E",flexShrink:0}}></span>
                {loading ? "Initializing" : "Operational"}
              </div>
            </div>

            <div className="palm-ai-card">
              <div className="palm-orb-wrap">
                <div className="palm-ring2" />
                <div className="palm-ring" />
                <div className="palm-orb" />
              </div>
              <div className="palm-ai-name">CURE · CORTEX</div>
              <div className="palm-ai-status">
                <div className="palm-dot" />
                {loading ? "Initializing..." : "Operational · Live"}
              </div>
            </div>

            <div className="palm-status-metrics">
              <div className="palm-metric">
                <div className="palm-metric-val">{loading ? "—" : stats.synthese}</div>
                <div className="palm-metric-lbl">Total</div>
              </div>
              <div className="palm-metric">
                <div className="palm-metric-val" style={{color:"#D63F3F"}}>{loading ? "—" : stats.jobsEnErreur}</div>
                <div className="palm-metric-lbl">Errors</div>
              </div>
              <div className="palm-metric">
                <div className="palm-metric-val" style={{color:"#1A9E6E"}}>{loading ? "—" : stats.aiProcessed}</div>
                <div className="palm-metric-lbl">Done</div>
              </div>
            </div>
          </div>

          {/* Right: recent activity */}
          <div className="palm-flow-card">
            <div className="palm-card-title">Recent activity</div>
            <table className="palm-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{textAlign:"center",color:"#8A8A9A",padding:"24px 0"}}>Loading...</td></tr>
                ) : recentFlows.length === 0 ? (
                  <tr><td colSpan={4} style={{textAlign:"center",color:"#8A8A9A",padding:"24px 0"}}>No recent flows</td></tr>
                ) : recentFlows.map((f, i) => (
                  <tr key={f.appReference || i}>
                    <td className="palm-mono">{f.appReference?.slice(0,14) || "—"}</td>
                    <td style={{color:"#8A8A9A",fontSize:12}}>{f.typeFlux?.flowType || "—"}</td>
                    <td><span className={`palm-badge ${getBadgeClass(f.mergedStatus)}`}>{f.mergedStatus || "—"}</span></td>
                    <td style={{fontSize:11,color:"#8A8A9A"}}>{formatDate(f.mergedDate) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ERROR ANALYSIS ── */}
        <ErrorAnalysisCard fluxData={rawFluxData} loading={loading} />

        {/* ── DAILY BAR CHART ── */}
        <div className="palm-chart-card">
          <div className="palm-card-title">Daily volume trend</div>
          {!loading && bars.length ? (
            <>
              <div className="palm-bars">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="palm-bar"
                    style={{ height:`${Math.max(4, Math.round((h / Math.max(...bars,1)) * 100))}%` }}
                    title={`${labels[i]}: ${h} flows`}
                  />
                ))}
              </div>
              <div className="palm-bar-labels">
                {labels.filter((_,i) => i % Math.ceil(labels.length/8) === 0).map((l) => <span key={l}>{l}</span>)}
              </div>
            </>
          ) : (
            <div style={{padding:"24px 0",textAlign:"center",color:"#8A8A9A",fontSize:13}}>No data available</div>
          )}
        </div>

        {/* ── FILE IN vs OUT CHART ── */}
        <div className="palm-linechart-card">
          <div className="palm-linechart-header">
            <div>
              <div className="palm-card-title">File IN vs OUT</div>
              <div className="palm-linechart-sub">Ingestion & emission over time</div>
            </div>
            <div className="palm-linechart-legend">
              <span className="palm-legend-item"><span className="palm-legend-dot" style={{background:"#5B4EE8"}} />File IN</span>
              <span className="palm-legend-item"><span className="palm-legend-dot" style={{background:"#1A9E6E"}} />File OUT</span>
            </div>
          </div>
          <div className="palm-linechart-kpis">
            <div className="palm-kpi"><div className="palm-kpi-val" style={{color:"#5B4EE8"}}>{totalIn}</div><div className="palm-kpi-lbl">Total IN</div></div>
            <div className="palm-kpi"><div className="palm-kpi-val" style={{color:"#1A9E6E"}}>{totalOut}</div><div className="palm-kpi-lbl">Total OUT</div></div>
            <div className="palm-kpi"><div className="palm-kpi-val">{successRate !== null ? `${successRate}%` : "—"}</div><div className="palm-kpi-lbl">Success rate</div></div>
            <div className="palm-kpi"><div className="palm-kpi-val" style={{color: errorRate > 0 ? "#D63F3F" : undefined}}>{errorRate !== null ? `${errorRate}%` : "—"}</div><div className="palm-kpi-lbl">Error rate</div></div>
          </div>
          <div className="palm-linechart-canvas-wrap">
            {!loading && labels.length
              ? <FileInOutChart labels={labels} inCounts={inCounts} outCounts={outCounts} />
              : <div style={{padding:"24px 0",textAlign:"center",color:"#8A8A9A",fontSize:13}}>Loading chart...</div>}
          </div>
        </div>

        {/* ── FLOW LIFECYCLE ── */}
        <div className="palm-linechart-card">
          <div className="palm-linechart-header">
            <div>
              <div className="palm-card-title">Flow lifecycle</div>
              <div className="palm-linechart-sub">Processing status evolution</div>
            </div>
            <div className="palm-linechart-legend">
              {[["#1A9E6E","Processed"],["#C47D18","Waiting"],["#D63F3F","Errors"],["#5B4EE8","In progress"]].map(([c,l]) => (
                <span key={l} className="palm-legend-item"><span className="palm-legend-dot" style={{background:c}} />{l}</span>
              ))}
            </div>
          </div>
          <div className="palm-progress-summary">
            {PROGRESS.map(({ lbl, val, color }) => {
              const pct = Math.round((val / progTotal) * 100);
              return (
                <div key={lbl} className="palm-progress-item">
                  <div className="palm-progress-meta">
                    <span style={{color:"#8A8A9A",fontSize:12}}>{lbl}</span>
                    <span style={{color,fontSize:12,fontWeight:600}}>{val} <span style={{color:"#8A8A9A",fontWeight:400}}>({pct}%)</span></span>
                  </div>
                  <div className="palm-progress-bar-bg">
                    <div className="palm-progress-bar-fill" style={{width:`${pct}%`,background:color}} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="palm-linechart-canvas-wrap">
            {!loading && labels.length
              ? <FluxAvancementChart labels={labels} processedCounts={processedCounts} errorCounts={errorCounts} waitingCounts={waitingCounts} inProgressCounts={inProgressCounts} />
              : <div style={{padding:"24px 0",textAlign:"center",color:"#8A8A9A",fontSize:13}}>Loading...</div>}
          </div>
        </div>

      </div>

      <NotificationPanel notifications={notifications} />
    </>
  );
}