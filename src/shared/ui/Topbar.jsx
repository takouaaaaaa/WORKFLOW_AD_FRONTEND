function UserTopbar({ email, role, onLogout, activePage, onOpenNotif }) {
  const isDashboard = activePage === "dashboard";
  return (
    <div className="palm-topbar">
      <div className="palm-logo">⬡ CURE</div>
      <div className="palm-topbar-right">
        <span>Cure Dashboard</span>
        <span style={{ opacity: 0.4 }}>|</span>
        {email && <div className="palm-user-chip">{email}</div>}
        {role  && <span className={`palm-badge ${role.toLowerCase()}`}>{role}</span>}
        {!isDashboard && (
          <div className="notif-ball" onClick={onOpenNotif} title="AI Notifications">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span className="notif-ball-count">{NOTIFS.length}</span>
          </div>
        )}
        <button className="palm-logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
