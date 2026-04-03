import { useEffect, useState } from "react";
import { getUsers } from "../services/adminUserService";
import { getSenders } from "../../technique/services/senderService";
import { getReceivers } from "../../technique/services/receiverService";
import { getTypeFluxes } from "../../technique/services/typeFluxService";
import { getFileIns } from "../../fonctionnel/services/fileInService";
import { getFileOuts } from "../../fonctionnel/services/fileOutService";

import AdminDashboardHeader from "../components/AdminDashboardHeader";
import AdminStatCard from "../components/AdminStatCard";
import AdminInfoPanel from "../components/AdminInfoPanel";
import AdminMiniBox from "../components/AdminMiniBox";

import "../styles/adminDashboard.css";

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
    <div className="admin-dashboard-page container-fluid px-0">
      <AdminDashboardHeader
        title="Admin Dashboard"
        subtitle="Global overview of your platform data and resources."
      />

      {loading ? (
        <div className="admin-dashboard-loading">
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-xl-4">
              <AdminStatCard icon="👥" label="Users" value={stats.users} />
            </div>
            <div className="col-12 col-md-6 col-xl-4">
              <AdminStatCard icon="📤" label="Senders" value={stats.senders} />
            </div>
            <div className="col-12 col-md-6 col-xl-4">
              <AdminStatCard icon="📥" label="Receivers" value={stats.receivers} />
            </div>
            <div className="col-12 col-md-6 col-xl-4">
              <AdminStatCard icon="🔀" label="Type Flux" value={stats.typeFlux} />
            </div>
            <div className="col-12 col-md-6 col-xl-4">
              <AdminStatCard icon="📄" label="File IN" value={stats.fileIns} />
            </div>
            <div className="col-12 col-md-6 col-xl-4">
              <AdminStatCard icon="🧾" label="File OUT" value={stats.fileOuts} />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-xl-6">
              <AdminInfoPanel title="System Summary">
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
              </AdminInfoPanel>
            </div>

            <div className="col-12 col-xl-6">
              <AdminInfoPanel title="Flow Activity">
                <p>Current number of flow-related records in the platform.</p>

                <div className="row g-3 mt-1">
                  <div className="col-12 col-sm-6">
                    <AdminMiniBox label="File IN" value={stats.fileIns} />
                  </div>
                  <div className="col-12 col-sm-6">
                    <AdminMiniBox label="File OUT" value={stats.fileOuts} />
                  </div>
                </div>
              </AdminInfoPanel>
            </div>

            <div className="col-12">
              <AdminInfoPanel title="Administrator Space" wide>
                <p>
                  From this space, you can manage users, configure senders and
                  receivers, define flow types, and monitor incoming/outgoing files.
                </p>

                <div className="admin-highlight">
                  ✅ Dynamic data loaded from backend services
                </div>
              </AdminInfoPanel>
            </div>
          </div>
        </>
      )}
    </div>
  );
}