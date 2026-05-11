import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Topbar from "./Topbar";
import Sidebar from "./sidebar";

import {
  clearToken,
  getRefreshToken,
  getUserFromToken,
} from "../../auth/utils/auth";

import {
  logoutUser,
  updateMyProfile,
} from "../../auth/services/authService";

import "./layout.css";

export default function AppLayout() {
  const navigate = useNavigate();

  const [user] = useState(() => getUserFromToken());
  const role = user?.roles?.[0];

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    role === "USER_TECHNIQUE"
  );

  useEffect(() => {
    console.log("AppLayout mounted, user:", getUserFromToken());
    console.log("token:", localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    return () => {
      console.log("AppLayout UNMOUNTED");
      console.log("token at unmount:", localStorage.getItem("token"));
    };
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, []);

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

  const handleSaveProfile = async (data) => {
    return await updateMyProfile(data);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="app-shell">
      <Topbar
        email={user.email}
        role={role}
        onLogout={handleLogout}
        onToggleSidebar={handleToggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
        onSaveProfile={handleSaveProfile}
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