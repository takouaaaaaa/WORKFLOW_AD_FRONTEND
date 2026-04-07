import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

import {
  clearToken,
  getRefreshToken,
  getUserFromToken,
} from "../../features/auth/utils/auth";

import { logoutUser } from "../../features/auth/services/authService";

import "./layout.css";

export default function AppLayout() {
  const navigate = useNavigate();

  const user = useMemo(() => getUserFromToken(), []);
  const role = user?.roles?.[0];

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    role === "USER_TECHNIQUE"
  );

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch (error) {
      console.error("Logout backend failed:", error);
    } finally {
      clearToken();
      navigate("/");
    }
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  if (!user) return null;

  return (
    <div className="app-shell">
      <Topbar
        email={user.email}
        role={role}
        onLogout={handleLogout}
        onToggleSidebar={handleToggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="app-layout">
        <Sidebar roles={user.roles || []} collapsed={sidebarCollapsed} />

        <div className="app-content">
          <div className="app-main-scroll">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}