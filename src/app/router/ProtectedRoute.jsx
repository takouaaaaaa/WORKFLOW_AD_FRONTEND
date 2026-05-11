import { Navigate, Outlet } from "react-router-dom";
import { getUserFromToken, hasRole, getToken } from "../../auth/utils/auth";

export default function ProtectedRoute({ allowedRoles }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const user = getUserFromToken();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}