import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROLES } from "./routeConfig";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layout/AppLayout";
import Login from "../../auth/pages/Login";

import FonctionnelDashboard from "../../roles/fonctionnel/pages/FonctionnelDashboard";
import FileInPage from "../../roles/fonctionnel/pages/FileInPage";
import FileOutPage from "../../roles/fonctionnel/pages/FileOutPage";

import AdminDashboard from "../../roles/admin/pages/AdminDashboard";
import UserManagementPage from "../../roles/admin/pages/UserManagementPage";

import TechniqueDashboard from "../../roles/technique/pages/TechniqueDashboard";
import SendersPage from "../../roles/technique/pages/SendersPage";
import ReceiversPage from "../../roles/technique/pages/ReceiverPage";
import TypeFluxPage from "../../roles/technique/pages/TypeFlux";

function UnauthorizedPage() {
  return <div style={{ padding: 24 }}>Access denied</div>;
}

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },

  {
    element: <ProtectedRoute allowedRoles={[ROLES.USER_FONCTIONNEL]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/fonctionnel", element: <FonctionnelDashboard /> },
          { path: "/fonctionnel/file-in", element: <FileInPage /> },
          { path: "/fonctionnel/file-out", element: <FileOutPage /> },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={[ROLES.USER_TECHNIQUE]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/technique", element: <TechniqueDashboard /> },
          { path: "/technique/senders", element: <SendersPage /> },
          { path: "/technique/receivers", element: <ReceiversPage /> },
          { path: "/technique/typeflux", element: <TypeFluxPage /> },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/admin", element: <AdminDashboard /> },
          { path: "/admin/users", element: <UserManagementPage /> },
          { path: "/admin/senders", element: <SendersPage /> },
          { path: "/admin/receivers", element: <ReceiversPage /> },
          { path: "/admin/typeflux", element: <TypeFluxPage /> },
          { path: "/admin/file-in", element: <FileInPage /> },
          { path: "/admin/file-out", element: <FileOutPage /> },
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);