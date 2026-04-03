import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
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
  const user = getUserFromToken();

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

  if (!user) return null;

  return (
    <div className="app-shell">
      <Topbar
        email={user.email}
        role={user.roles?.[0]}
        onLogout={handleLogout}
      />

      <div className="app-layout">
        <Sidebar roles={user.roles || []} />

        <div className="app-content">
          <div className="app-main-scroll">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}