import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FileSearchPage from "./pages/FileSearchPage";

export const router = createBrowserRouter([
  { path: "/",                    element: <Login /> },
  { path: "/register",            element: <Register /> },
  { path: "/dashboard",           element: <Dashboard /> },
  { path: "/dashboard/:type",        element: <FileSearchPage /> },
]);