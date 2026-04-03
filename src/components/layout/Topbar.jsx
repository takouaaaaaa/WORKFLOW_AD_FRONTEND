export default function Topbar({ email, role, onLogout }) {
  return (
    <div className="app-topbar">
      <div className="app-logo">⬡ CURE</div>

      <div className="app-topbar-right">
        <span>Cure Dashboard</span>
        <span style={{ opacity: 0.4 }}>|</span>

        {email && <div className="app-user-chip">{email}</div>}

        {role && <span className="app-badge">{role}</span>}

        <button className="app-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}