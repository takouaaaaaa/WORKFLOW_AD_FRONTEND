import { Navigate, Outlet } from "react-router-dom";
import { getUserFromToken, hasRole } from "../../features/auth/utils/auth";

export default function ProtectedRoute({ allowedRoles }) {
  const user = getUserFromToken();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}