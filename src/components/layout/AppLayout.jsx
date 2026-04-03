import { Outlet, useNavigate } from "react-router-dom";
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

  // sécurité : si pas de user → rien afficher
  if (!user) return null;

  return (
    <div className="palm-body">
      
      {/* TOPBAR */}
      <Topbar
        email={user.email}
        role={user.roles?.[0]}
        onLogout={handleLogout}
      />

      {/* LAYOUT */}
      <div className="palm-layout">
        <Sidebar roles={user.roles || []} />

        {/* PAGE CONTENT */}
        <div className="palm-content">
          <Outlet />
        </div>
      </div>

    </div>
  );
}