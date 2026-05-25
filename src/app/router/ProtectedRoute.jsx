import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import {
  getUserFromToken,
  hasRole,
  getToken,
  getRefreshToken,
  setAccessToken,
  clearToken,
} from "../../auth/utils/auth";
import { refreshAccessToken } from "../../auth/services/authService";

export default function ProtectedRoute({ allowedRoles }) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let token = getToken();

        if (!token) {
          const refreshToken = getRefreshToken();

          if (!refreshToken) {
            setAuthorized(false);
            return;
          }

          const res = await refreshAccessToken(refreshToken);
          token = res.data.accessToken;

          if (!token) {
            clearToken();
            setAuthorized(false);
            return;
          }

          setAccessToken(token);
        }

        const user = getUserFromToken();

        if (!user) {
          clearToken();
          setAuthorized(false);
          return;
        }

        if (!hasRole(allowedRoles)) {
          setDenied(true);
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        clearToken();
        setAuthorized(false);
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (checking) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (denied) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!authorized) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}