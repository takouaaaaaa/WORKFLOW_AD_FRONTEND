import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Topbar({
  email,
  role,
  onLogout,
  onToggleSidebar,
  sidebarCollapsed,
}) {
  return (
    <div className="app-topbar">
      <div className="app-topbar-left">
        <button
          className="app-sidebar-toggle-topbar"
          onClick={onToggleSidebar}
          type="button"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div className="app-logo">⬡ CURE</div>
      </div>

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