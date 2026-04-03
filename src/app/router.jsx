import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROLES } from "./routeConfig";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import Login from "../features/auth/pages/Login";

import FonctionnelDashboard from "../features/fonctionnel/pages/FonctionnelDashboard";
import FileInPage from "../features/fonctionnel/pages/FileInPage";
import FileOutPage from "../features/fonctionnel/pages/FileOutPage";

import AdminDashboard from "../features/admin/pages/AdminDashboard";
import UserManagementPage from "../features/admin/pages/UserManagementPage";

import TechniqueDashboard from "../features/technique/pages/TechniqueDashboard";
import SendersPage from "../features/technique/pages/SendersPage";
import ReceiversPage from "../features/technique/pages/ReceiversPage";
import TypeFluxPage from "../features/technique/pages/TypeFluxPage";

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