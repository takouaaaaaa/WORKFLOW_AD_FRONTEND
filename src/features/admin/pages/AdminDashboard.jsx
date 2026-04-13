import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import AdminChartsSection from "../components/AdminChartsSection";
import { getAdminDashboardStats } from "../services/adminDashboardService";
import "../styles/adminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const mountedRef = useRef(true);

  const loadDashboard = useCallback(async (isManual = false) => {
    if (!mountedRef.current) return;

    try {
      isManual ? setRefreshing(true) : setLoading(true);
      setError("");

      const data = await getAdminDashboardStats();

      if (!mountedRef.current) return;
      if (!data || typeof data !== "object") {
        throw new Error("Dashboard data is empty or invalid");
      }

      setStats(data);
    } catch (err) {
      console.error("Admin dashboard error:", err);
      if (mountedRef.current) {
        setError(err?.message || "Failed to load dashboard");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadDashboard(false);

    const interval = setInterval(() => loadDashboard(true), 7000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [loadDashboard]);

  return (
    <div className="admin-dashboard-page">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>

        <button
          className="admin-refresh-btn"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
        >
          <RefreshCw size={15} className={refreshing ? "spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading && !stats ? (
        <div className="admin-loading">Loading dashboard...</div>
      ) : error ? (
        <div className="admin-error">
          <strong>Dashboard error:</strong> {error}
        </div>
      ) : !stats ? (
        <div className="admin-empty">No dashboard data available.</div>
      ) : (
        <AdminChartsSection stats={stats} />
      )}
    </div>
  );
}