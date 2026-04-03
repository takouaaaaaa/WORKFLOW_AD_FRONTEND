import { NavLink } from "react-router-dom";
import { useState } from "react";
import { ROLES } from "../../app/routeConfig";
import {
  House,
  Users,
  Send,
  Inbox,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar({ roles }) {
  const role = roles?.[0];
  const [collapsed, setCollapsed] = useState(false);

  let items = [];

  if (role === ROLES.ADMIN) {
    items = [
      { label: "Dashboard", path: "/admin", icon: <House size={18} /> },
      { label: "Users", path: "/admin/users", icon: <Users size={18} /> },
      { label: "Senders", path: "/admin/senders", icon: <Send size={18} /> },
      { label: "Receivers", path: "/admin/receivers", icon: <Inbox size={18} /> },
      { label: "Type Flux", path: "/admin/typeflux", icon: <FolderOpen size={18} /> },
      { label: "File IN", path: "/admin/file-in", icon: <Inbox size={18} /> },
      { label: "File OUT", path: "/admin/file-out", icon: <Send size={18} /> },
    ];
  } else if (role === ROLES.USER_FONCTIONNEL) {
    items = [
      { label: "Dashboard", path: "/fonctionnel", icon: <House size={18} /> },
      { label: "File IN", path: "/fonctionnel/file-in", icon: <Inbox size={18} /> },
      { label: "File OUT", path: "/fonctionnel/file-out", icon: <Send size={18} /> },
    ];
  } else if (role === ROLES.USER_TECHNIQUE) {
    items = [
      { label: "Dashboard", path: "/technique", icon: <House size={18} /> },
      { label: "Senders", path: "/technique/senders", icon: <Send size={18} /> },
      { label: "Receivers", path: "/technique/receivers", icon: <Inbox size={18} /> },
      { label: "Type Flux", path: "/technique/typeflux", icon: <FolderOpen size={18} /> },
    ];
  }

  return (
    <div className={`app-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="app-sidebar-header">
        {!collapsed && <div className="app-sidebar-title">Navigation</div>}

        <button
          className="app-sidebar-toggle btn btn-sm"
          onClick={() => setCollapsed(!collapsed)}
          type="button"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="app-sidebar-section">{!collapsed && "Menu"}</div>

      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            isActive ? "app-nav-item active" : "app-nav-item"
          }
          title={collapsed ? item.label : ""}
        >
          <span className="app-nav-icon">{item.icon}</span>
          {!collapsed && <span className="app-nav-label">{item.label}</span>}
        </NavLink>
      ))}
    </div>
  );
}