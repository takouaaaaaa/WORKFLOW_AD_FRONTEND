import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import FileInPage from "./pages/FileInPage";
import FileOutPage from "./pages/FileOutPage";

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/dashboard/file-in", element: <FileInPage /> },
  { path: "/dashboard/file-out", element: <FileOutPage /> },
]);