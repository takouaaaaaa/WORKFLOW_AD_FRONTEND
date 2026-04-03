import "./Dashboard.css";

const FLOWS = [
  { ref: "CURE1867692", type: "ref-atena", date: "04/02 02:16" },
  { ref: "CURE1867691", type: "ref-contrat-restitution", date: "04/02 02:02" },
  { ref: "CURE1867675", type: "ref-sible", date: "03/02 18:59" },
];

const MONITORS = [
  { name: "MFT", time: "04/02 09:42" },
  { name: "MQ", time: "04/02 09:42" },
  { name: "PASAP", time: "04/02 09:42" },
];

const NOTIFS = [
  { type: "error", label: "⚠ Error Detected", ref: "CURE1867690", time: "04/02/2026 · 02:18", msg: "Flow processing failed on ref-contrat-restitution. Retry scheduled in 5 min." },
  { type: "success", label: "✓ Flow Completed", ref: "CURE1867692", time: "04/02/2026 · 02:16", msg: "ref-atena processed successfully by AI engine. 3 records validated." },
  { type: "warning", label: "⚡ High Load", ref: null, time: "04/02/2026 · 02:10", msg: "AI engine processing queue reached 85% capacity. Consider scaling resources." },
  { type: "info", label: "ℹ Model Update", ref: null, time: "04/02/2026 · 01:55", msg: "AI classification model v2.4.1 deployed. Accuracy improved by +1.3%." },
];

const BARS = [35, 50, 42, 80, 65, 90, 72, 55, 88, 100, 76, 60];
const BAR_LABELS = ["21:00", "22:00", "23:00", "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00"];

const STATS = [
  { label: "Synthèse", value: "1027", cls: "warn", sub: "12,245 total", icon: "📊" },
  { label: "Jobs en erreurs", value: "0", cls: "ok", sub: "196 monitored", icon: "⚙️" },
  { label: "Requêtes Pré.", value: "1069", cls: "warn", sub: "5,285 total", icon: "🔍" },
  { label: "AI Processed", value: "3", cls: "ok", sub: "Flows today", icon: "🤖" },
];

function NotificationPanel() {
  return (
    <div className="palm-notif-panel">
      <div className="palm-notif-header">
        AI Notifications
        <span className="palm-notif-count">{NOTIFS.length}</span>
      </div>

      {NOTIFS.map((n, i) => (
        <div key={i} className={`palm-notif-item ${n.type}`}>
          <div className="palm-notif-type">{n.label}</div>
          <div className="palm-notif-msg">{n.msg}</div>
          {n.ref && <div className="palm-notif-ref">{n.ref}</div>}
          <div className="palm-notif-time">{n.time}</div>
        </div>
      ))}
    </div>
  );
}

export default function FonctionnelDashboard() {
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
              Online · Processing
            </div>
            <div className="palm-ai-metrics">
              {[
                { val: "98.7%", lbl: "Accuracy" },
                { val: "142ms", lbl: "Avg Latency" },
                { val: "3.2K", lbl: "Flows/day" },
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
                {FLOWS.map((f) => (
                  <tr key={f.ref}>
                    <td className="palm-mono">{f.ref}</td>
                    <td>{f.type}</td>
                    <td><span className="palm-badge ok">Processed</span></td>
                    <td style={{ fontSize: 11, color: "var(--muted)" }}>{f.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="palm-card-title" style={{ marginTop: 18 }}>Monitoring · Services</div>
            {MONITORS.map((m) => (
              <div key={m.name} className="palm-monitor-row">
                <span style={{ fontSize: 13 }}>{m.name}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{m.time}</span>
                <span className="palm-badge ok">OK</span>
              </div>
            ))}
          </div>

          <div className="palm-chart-card">
            <div className="palm-card-title">AI Flow Processing · Last 12h</div>
            <div className="palm-bars">
              {BARS.map((h, i) => (
                <div key={i} className="palm-bar" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="palm-bar-labels">
              {BAR_LABELS.map((l) => <span key={l}>{l}</span>)}
            </div>
          </div>
        </div>
      </div>

      <NotificationPanel />
    </>
  );
}