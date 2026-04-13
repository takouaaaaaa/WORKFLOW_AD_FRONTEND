import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import AdminChartsSection from "../components/AdminChartsSection";
import { getAdminDashboardStats } from "../services/adminDashboardService";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const mountedRef = useRef(true);

  const loadDashboard = useCallback(async (isManual = false) => {
    try {
      if (!mountedRef.current) return;

      if (isManual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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

    const interval = setInterval(() => {
      loadDashboard(true);
    }, 7000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [loadDashboard]);

  return (
    <div className="admin-dashboard-page">
      <style>{`
        .admin-dashboard-page {
          padding: 24px;
          color: #e2e8f0;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .admin-title {
          font-size: 28px;
          font-weight: 700;
          color: #f8fafc;
          margin: 0;
        }

        .admin-refresh-btn {
          border: 1px solid rgba(124, 111, 247, 0.35);
          background: #1e293b;
          color: white;
          padding: 10px 14px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .admin-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .admin-loading,
        .admin-error,
        .admin-empty {
          text-align: center;
          margin-top: 40px;
          padding: 18px;
          border-radius: 12px;
        }

        .admin-loading {
          color: #94a3b8;
        }

        .admin-error {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
        }

        .admin-empty {
          background: rgba(148, 163, 184, 0.08);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #cbd5e1;
        }
      `}</style>

      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>

        <button
          className="admin-refresh-btn"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? "spin" : ""} />
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