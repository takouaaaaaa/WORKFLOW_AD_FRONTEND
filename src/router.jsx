import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";


export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  {path: "/register", element: < Register/>},
  { path: "/dashboard", element: <Dashboard /> },
  
]);