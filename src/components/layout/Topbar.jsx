export default function Topbar({ email, role, onLogout }) {
  return (
    <div className="palm-topbar">
      <div className="palm-logo">⬡ CURE</div>

      <div className="palm-topbar-right">
        <span>Cure Dashboard</span>
        <span style={{ opacity: 0.4 }}>|</span>

        {email && <div className="palm-user-chip">{email}</div>}

        {role && (
          <span className={`palm-badge ${String(role).toLowerCase()}`}>
            {role}
          </span>
        )}

        <button className="palm-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}