import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/api";
import { registerUser } from "../services/api";
import { jwtDecode } from "jwt-decode";
import "./Dashboard.css";


//  STATIC DATA

const FLOWS = [
  { ref: "CURE1867692", type: "ref-atena",               date: "04/02 02:16" },
  { ref: "CURE1867691", type: "ref-contrat-restitution", date: "04/02 02:02" },
  { ref: "CURE1867675", type: "ref-sible",               date: "03/02 18:59" },
];

const MONITORS = [
  { name: "MFT",   time: "04/02 09:42" },
  { name: "MQ",    time: "04/02 09:42" },
  { name: "PASAP", time: "04/02 09:42" },
];

const NOTIFS = [
  { type: "error",   label: "⚠ Error Detected", ref: "CURE1867690", time: "04/02/2026 · 02:18", msg: "Flow processing failed on ref-contrat-restitution. Retry scheduled in 5 min." },
  { type: "success", label: "✓ Flow Completed",  ref: "CURE1867692", time: "04/02/2026 · 02:16", msg: "ref-atena processed successfully by AI engine. 3 records validated." },
  { type: "warning", label: "⚡ High Load",       ref: null,          time: "04/02/2026 · 02:10", msg: "AI engine processing queue reached 85% capacity. Consider scaling resources." },
  { type: "info",    label: "ℹ Model Update",    ref: null,          time: "04/02/2026 · 01:55", msg: "AI classification model v2.4.1 deployed. Accuracy improved by +1.3%." },
  { type: "success", label: "✓ Batch Done",       ref: null,          time: "04/02/2026 · 01:30", msg: "Nightly batch of 1,027 items processed. 0 errors. 100% completion rate." },
  { type: "info",    label: "ℹ Monitoring",       ref: null,          time: "04/02/2026 · 09:42", msg: "MFT, MQ, PASAP services all reporting healthy status." },
  { type: "warning", label: "⚡ Anomaly",          ref: "CURE1867675", time: "03/02/2026 · 19:02", msg: "AI detected unusual pattern in ref-sible flow. Manual review recommended." },
];

const BARS       = [35, 50, 42, 80, 65, 90, 72, 55, 88, 100, 76, 60];
const BAR_LABELS = ["21:00","22:00","23:00","00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00"];

const STATS = [
  { label: "Synthèse",        value: "1027", cls: "warn", sub: "12,245 total",  icon: "📊" },
  { label: "Jobs en erreurs", value: "0",    cls: "ok",   sub: "196 monitored", icon: "⚙️" },
  { label: "Requêtes Pré.",   value: "1069", cls: "warn", sub: "5,285 total",   icon: "🔍" },
  { label: "AI Processed",    value: "3",    cls: "ok",   sub: "Flows today",   icon: "🤖" },
];

// ─────────────────────────────────────────────────────────────────
//  SHARED: RIGHT NOTIFICATION PANEL
// ─────────────────────────────────────────────────────────────────
function UserNotifPanel() {
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

// ─────────────────────────────────────────────────────────────────
//  PAGE: DASHBOARD (main)
// ─────────────────────────────────────────────────────────────────
function PageDashboard({ onNavigate }) {
  return (
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
              { val: "98.7%", lbl: "Accuracy"    },
              { val: "142ms", lbl: "Avg Latency" },
              { val: "3.2K",  lbl: "Flows/day"   },
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

        <div className="dash-file-link" onClick={() => onNavigate("file-in")}>
          <div className="dash-file-link-icon" style={{ background: "rgba(0,180,255,0.12)", color: "var(--accent)" }}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="12" x2="12" y2="18" />
              <polyline points="9 15 12 18 15 15" />
            </svg>
          </div>
          <div>
            <div className="dash-file-link-title">File IN</div>
            <div className="dash-file-link-sub">Search incoming files</div>
          </div>
          <svg className="dash-file-link-arrow" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>

        <div className="dash-file-link" onClick={() => onNavigate("file-out")}>
          <div className="dash-file-link-icon" style={{ background: "rgba(124,58,237,0.12)", color: "var(--accent2)" }}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 12 15 15" />
            </svg>
          </div>
          <div>
            <div className="dash-file-link-title">File OUT</div>
            <div className="dash-file-link-sub">Search outgoing files</div>
          </div>
          <svg className="dash-file-link-arrow" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  USER DASHBOARD
// ─────────────────────────────────────────────────────────────────
function UserDashboard({ email, role, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [notifOpen, setNotifOpen]   = useState(false);
  const isDashboard = activePage === "dashboard";
  const navigate = useNavigate();

  const renderPage = () => {
    return <PageDashboard onNavigate={(p) => {
      if (p === "file-in" || p === "file-out") {
        navigate("/dashboard/" + p);
      } else {
        setActivePage(p);
      }
    }} />;
  };

  return (
    <div className="palm-body">
      <UserTopbar
        email={email}
        role={role}
        onLogout={onLogout}
        activePage={activePage}
        onOpenNotif={() => setNotifOpen((v) => !v)}
      />
      <div className={`palm-layout${isDashboard ? "" : " palm-layout-no-panel"}`}>
        <UserSidebar activePage={activePage} onNavigate={(p) => {
          setNotifOpen(false);
          if (p === "file-in" || p === "file-out") {
            navigate("/dashboard/" + p);
          } else {
            setActivePage(p);
          }
        }} />
        {renderPage()}
        {isDashboard && <UserNotifPanel />}
        {!isDashboard && notifOpen && (
          <div className="notif-drawer">
            <div className="notif-drawer-header">
              <span>AI Notifications</span>
              <button className="notif-drawer-close" onClick={() => setNotifOpen(false)}>✕</button>
            </div>
            <UserNotifPanel />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  ADMIN COMPONENTS
// ─────────────────────────────────────────────────────────────────
function AdminTopbar({ email, onLogout }) {
  return (
    <div className="admin-topbar">
      <div className="admin-logo">⬡ CURE</div>
      <div className="admin-topbar-right">
        <div className="admin-tabs">
          <button className="admin-tab active">Cure Dashboard</button>
        </div>
        {email && <div className="admin-user-chip">{email}</div>}
        <button className="admin-logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

function AdminTodoStrip() {
  return (
    <div className="admin-todo-strip">
      <span className="admin-todo-label">To Do List</span>
      <div className="admin-todo-item">
        <span className="admin-todo-name">1-Synthèse des...</span>
        <span className="admin-todo-num orange">1027</span>
        <span className="admin-todo-sub">12245</span>
      </div>
      <div className="admin-todo-item">
        <span className="admin-todo-name">2-Jobs en erreurs</span>
        <span className="admin-todo-num green">0</span>
        <span className="admin-todo-sub">196</span>
      </div>
      <div className="admin-todo-item">
        <span className="admin-todo-name">3-Requêtes Prée...</span>
        <span className="admin-todo-num orange">1069</span>
        <span className="admin-todo-sub">5285</span>
      </div>
    </div>
  );
}

function AdminFlowTable() {
  return (
    <div className="admin-card">
      <div className="admin-card-title">ReferenceFlow-search : Reference Flow</div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>App Reference ⇕</th>
            <th>Id Flow Type ⇕</th>
            <th>Status ⇕</th>
            <th>Creation Date ⇕</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>CURE1867692</td><td>ref-atena</td><td><span className="admin-badge processed">Processed</span></td><td>04/02/2026 02:16:01:242</td></tr>
          <tr><td>CURE1867691</td><td>ref-contrat-restitution</td><td><span className="admin-badge processed">Processed</span></td><td>04/02/2026 02:02:01:271</td></tr>
          <tr><td>CURE1867675</td><td>ref-sible</td><td><span className="admin-badge processed">Processed</span></td><td>03/02/2026 18:59:00:530</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function AdminMonitoringTable() {
  return (
    <div className="admin-card">
      <div className="admin-card-title">Monitoring Item-Search : Monitoring Item</div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Description ⇕</th>
            <th>Last Check Time Stamp ⇕</th>
            <th>Name ⇕</th>
            <th>Status ⇕</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ background: "#dcfce7" }}><td></td><td>04/02/2026 09:42:16:157</td><td>MFT</td><td><span className="admin-monitor-ok">OK</span></td></tr>
          <tr style={{ background: "#dcfce7" }}><td></td><td>04/02/2026 09:42:16:246</td><td>MQ</td><td><span className="admin-monitor-ok">OK</span></td></tr>
          <tr style={{ background: "#dcfce7" }}><td></td><td>04/02/2026 09:42:16:369</td><td>PASAP</td><td><span className="admin-monitor-ok">OK</span></td></tr>
        </tbody>
      </table>
    </div>
  );
}

function AdminUsersTable({ users, error, onDelete }) {
  const getRoleLabel = (role) => {
    if (!role) return "User";
    if (role === "ADMIN") return "Admin";
    if (role === "USER_FONCTIONNEL") return "Fonctionnel";
    if (role === "USER_TECHNIQUE") return "Technique";
    return role;
  };

  return (
    <div className="admin-card">
      <div className="admin-card-title">Users Management</div>
      {error && <div className="admin-error">{error}</div>}
      <table className="admin-table" style={{ tableLayout: "fixed", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ width: "50px" }}>ID</th>
            <th>Email</th>
            <th style={{ width: "110px" }}>Phone</th>
            <th style={{ width: "110px" }}>Role</th>
            <th style={{ width: "80px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</td>
              <td>{u.numTel}</td>
              <td>
                <span className={`admin-badge ${u.role === "ADMIN" ? "admin-role" : "user-role"}`}>
                  {getRoleLabel(u.role)}
                </span>
              </td>
              <td>
                <button className="admin-delete-btn" onClick={() => onDelete(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminRegisterForm({ showRegister, setShowRegister, form, handleChange, handleRegister, registerError, registerSuccess }) {
  return (
    <div className="admin-card">
      <div className="admin-register-header">
        <div className="admin-card-title">Add New User</div>
        <button className="admin-add-btn" onClick={() => setShowRegister(!showRegister)}>
          {showRegister ? "Cancel" : "+ Add User"}
        </button>
      </div>
      {showRegister && (
        <form onSubmit={handleRegister} className="admin-register-form">
          {registerError && <div className="admin-error">{registerError}</div>}
          {registerSuccess && <div className="admin-success">{registerSuccess}</div>}
          <div className="admin-register-grid">
            <div className="admin-register-field">
              <label className="admin-register-label">Email</label>
              <input type="email" name="email" placeholder="user@example.com" value={form.email} onChange={handleChange} required className="admin-register-input" />
            </div>
            <div className="admin-register-field">
              <label className="admin-register-label">Password</label>
              <input type="password" name="motDePasse" placeholder="••••••••" value={form.motDePasse} onChange={handleChange} required className="admin-register-input" />
            </div>
            <div className="admin-register-field">
              <label className="admin-register-label">Phone</label>
              <input type="number" name="numTel" placeholder="12345678" value={form.numTel} onChange={handleChange} required className="admin-register-input" />
            </div>
            <div className="admin-register-field">
              <label className="admin-register-label">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className="admin-register-input">
                <option value="USER_FONCTIONNEL">User Fonctionnel</option>
                <option value="USER_TECHNIQUE">User Technique</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" className="admin-register-submit">Create User</button>
           <button className="admin-delete-btn" onClick={() => onDelete(u.id)}>Delete</button>

        </form>
      )}
    </div>
  );
}

function AdminWidgetPanel() {
  return (
    <div className="admin-right-panel">
      <div className="admin-widget-title">Widget</div>
      <div className="admin-widget-title" style={{ marginTop: 12 }}>Common Links</div>
      <div>
        <span className="admin-link-chip">Banque de France</span>
        <span className="admin-link-chip">WIKI CURE</span>
      </div>
      <div className="admin-widget-title" style={{ marginTop: 16 }}>My Links</div>
    </div>
  );
}

function AdminDashboard({ email, users, error, onDelete, onLogout, showRegister, setShowRegister, form, handleChange, handleRegister, registerError, registerSuccess }) {
  return (
    <div className="admin-body">
      <AdminTopbar email={email} onLogout={onLogout} />
      <div className="admin-layout">
        <div className="admin-main">
          <AdminTodoStrip />
          <AdminFlowTable />
          <AdminMonitoringTable />
          <AdminUsersTable users={users} error={error} onDelete={onDelete} />
          <AdminRegisterForm
            showRegister={showRegister}
            setShowRegister={setShowRegister}
            form={form}
            handleChange={handleChange}
            handleRegister={handleRegister}
            registerError={registerError}
            registerSuccess={registerSuccess}
          />
        </div>
        <AdminWidgetPanel />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  ROOT
// ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [users, setUsers]                   = useState([]);
  const [error, setError]                   = useState("");
  const [role,  setRole]                    = useState("");
  const [email, setEmail]                   = useState("");
  const [showRegister, setShowRegister]     = useState(false);
  const [form, setForm]                     = useState({ email: "", motDePasse: "", numTel: "", role: "USER_FONCTIONNEL" });
  const [registerError, setRegisterError]   = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setRole(decoded.role);
      setEmail(decoded.sub);
    }
  }, []);

  useEffect(() => {
    if (role === "ADMIN") {
      axiosInstance.get("/users")
        .then((res) => setUsers(res.data))
        .catch(() => setError("Failed to load users"));
    }
  }, [role]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("Failed to delete user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    try {
      await registerUser({ ...form, numTel: Number(form.numTel) });
      setRegisterSuccess("User created successfully!");
      setForm({ email: "", motDePasse: "", numTel: "", role: "USER_FONCTIONNEL" });
      const res = await axiosInstance.get("/users");
      setUsers(res.data);
      setShowRegister(false);
    } catch (err) {
      setRegisterError("Failed to create user");
    }
  };

  if (role === "ADMIN") {
    return (
      <AdminDashboard
        email={email}
        users={users}
        error={error}
        onDelete={handleDelete}
        onLogout={handleLogout}
        showRegister={showRegister}
        setShowRegister={setShowRegister}
        form={form}
        handleChange={handleChange}
        handleRegister={handleRegister}
        registerError={registerError}
        registerSuccess={registerSuccess}
      />
    );
  }

  return (
    <UserDashboard
      email={email}
      role={role}
      onLogout={handleLogout}
    />
  );
}