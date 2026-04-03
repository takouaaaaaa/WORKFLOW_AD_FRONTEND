import { useEffect, useState } from "react";
import { getUsers } from "../services/adminUserService";
import { getSenders } from "../../technique/services/senderService";
import { getReceivers } from "../../technique/services/receiverService";
import { getTypeFluxes } from "../../technique/services/typeFluxService";
import { getFileIns } from "../../fonctionnel/services/fileInService";
import { getFileOuts } from "../../fonctionnel/services/fileOutService";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    senders: 0,
    receivers: 0,
    typeFlux: 0,
    fileIns: 0,
    fileOuts: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getCount = (res) => {
    const data = Array.isArray(res.data) ? res.data : res.data.content || [];
    return data.length;
  };

  const fetchDashboardData = async () => {
    try {
      const [
        usersRes,
        sendersRes,
        receiversRes,
        typeFluxRes,
        fileInsRes,
        fileOutsRes,
      ] = await Promise.all([
        getUsers(),
        getSenders(),
        getReceivers(),
        getTypeFluxes(),
        getFileIns(),
        getFileOuts(),
      ]);

      setStats({
        users: getCount(usersRes),
        senders: getCount(sendersRes),
        receivers: getCount(receiversRes),
        typeFlux: getCount(typeFluxRes),
        fileIns: getCount(fileInsRes),
        fileOuts: getCount(fileOutsRes),
      });
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Global overview of your platform data and resources.</p>
      </div>

      {loading ? (
        <div className="admin-dashboard-loading">Loading dashboard...</div>
      ) : (
        <>
          <div className="admin-dashboard-stats">
            <div className="admin-stat-card">
              <div className="admin-stat-icon">👥</div>
              <div className="admin-stat-content">
                <span className="admin-stat-label">Users</span>
                <h2>{stats.users}</h2>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">📤</div>
              <div className="admin-stat-content">
                <span className="admin-stat-label">Senders</span>
                <h2>{stats.senders}</h2>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">📥</div>
              <div className="admin-stat-content">
                <span className="admin-stat-label">Receivers</span>
                <h2>{stats.receivers}</h2>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">🔀</div>
              <div className="admin-stat-content">
                <span className="admin-stat-label">Type Flux</span>
                <h2>{stats.typeFlux}</h2>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">📄</div>
              <div className="admin-stat-content">
                <span className="admin-stat-label">File IN</span>
                <h2>{stats.fileIns}</h2>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">🧾</div>
              <div className="admin-stat-content">
                <span className="admin-stat-label">File OUT</span>
                <h2>{stats.fileOuts}</h2>
              </div>
            </div>
          </div>

          <div className="admin-dashboard-grid">
            <div className="admin-panel">
              <h3>System Summary</h3>
              <p>
                This admin dashboard gives you a quick overview of all platform
                entities and technical resources.
              </p>
              <ul>
                <li>Total users registered: <b>{stats.users}</b></li>
                <li>Total senders configured: <b>{stats.senders}</b></li>
                <li>Total receivers configured: <b>{stats.receivers}</b></li>
                <li>Total flow types available: <b>{stats.typeFlux}</b></li>
              </ul>
            </div>

            <div className="admin-panel">
              <h3>Flow Activity</h3>
              <p>Current number of flow-related records in the platform.</p>
              <div className="admin-mini-stats">
                <div className="mini-box">
                  <span>File IN</span>
                  <strong>{stats.fileIns}</strong>
                </div>
                <div className="mini-box">
                  <span>File OUT</span>
                  <strong>{stats.fileOuts}</strong>
                </div>
              </div>
            </div>

            <div className="admin-panel wide">
              <h3>Administrator Space</h3>
              <p>
                From this space, you can manage users, configure senders and
                receivers, define flow types, and monitor incoming/outgoing files.
              </p>
              <div className="admin-highlight">
                <span>✅ Dynamic data loaded from backend services</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}