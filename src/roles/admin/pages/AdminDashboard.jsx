import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  Users,
  ShieldCheck,
  UserCog,
  Activity,
  FileInput,
  FileOutput,
  BrainCircuit,
  LockKeyhole,
  Database,
  Server,
  Download,
  ClipboardList,
} from "lucide-react";
import {
  Chart,
  DoughnutController,
  LineController,
  PolarAreaController,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

import { getAdminDashboardStats } from "../services/adminDashboardService";
import "../styles/AdminDashboard.css";

Chart.register(
  DoughnutController,
  LineController,
  PolarAreaController,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend
);

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function sumArray(value) {
  return Array.isArray(value)
    ? value.reduce((a, b) => a + safeNumber(b), 0)
    : 0;
}

function normalizeSeries(series, targetLength) {
  const arr = Array.isArray(series) ? series : [];

  if (targetLength <= 0) return arr;
  if (arr.length === targetLength) return arr;
  if (arr.length > targetLength) return arr.slice(0, targetLength);

  return [...arr, ...new Array(targetLength - arr.length).fill(0)];
}

function HealthRow({ icon, label, status, type = "ok" }) {
  return (
    <div className="admin-health-row">
      <div className={`admin-health-icon ${type}`}>{icon}</div>

      <div className="admin-health-info">
        <strong>{label}</strong>
        <p>{status}</p>
      </div>

      <span className={`admin-health-dot ${type}`} />
    </div>
  );
}

function MiniMetric({ icon, label, value, sub, type }) {
  return (
    <div className={`admin-mini-metric ${type || ""}`}>
      <div className="admin-mini-icon">{icon}</div>

      <span>{label}</span>
      <strong>{value}</strong>
      <p>{sub}</p>
    </div>
  );
}

function RecentActivity({ activities }) {
  return (
    <div className="admin-panel admin-activity-panel">
      <div className="admin-panel-head">
        <div>
          <h3>Recent Platform Activity</h3>
          <p>Global activity preview without operational actions.</p>
        </div>

        <ClipboardList size={22} />
      </div>

      <div className="admin-activity-list">
        {activities.map((item, index) => (
          <div className="admin-activity-row" key={index}>
            <div className={`admin-activity-icon ${item.type}`}>
              {item.icon}
            </div>

            <div>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
            </div>

            <span>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersByRoleChart({ admins, technique, fonctionnel }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const total = admins + technique + fonctionnel;

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
       labels: ["Administrators", "Technical Users", "Functional Users"],
        datasets: [
          {
            data: [admins, technique, fonctionnel],
            backgroundColor: ["#7c3aed", "#0099ff", "#ff7a00"],
            borderColor: "#06111f",
            borderWidth: 3,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(2,10,18,0.96)",
            borderColor: "rgba(0,255,204,0.22)",
            borderWidth: 1,
            titleColor: "#ffffff",
            bodyColor: "rgba(255,255,255,0.75)",
            padding: 12,
            callbacks: {
              label: (ctx) => {
                const value = ctx.raw || 0;
                const pct = total ? Math.round((value / total) * 100) : 0;
                return ` ${ctx.label}: ${value} (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [admins, technique, fonctionnel, total]);

  return (
    <div className="admin-chart-card">
      <div className="admin-chart-head">
        <div>
          <h3>Users by Role</h3>
          <p>Distribution of accounts across platform roles.</p>
        </div>

        <button className="admin-chart-menu">⋮</button>
      </div>

      <div className="admin-donut-layout">
        <div className="admin-donut-wrap">
          <canvas ref={canvasRef} />

          <div className="admin-donut-center">
            <strong>{total}</strong>
            <span>Total Users</span>
          </div>
        </div>

        <div className="admin-chart-legend">
          <div>
            <span className="admin-legend-dot purple" />
            <p>Administrators</p>
            <strong>{admins}</strong>
          </div>

          <div>
            <span className="admin-legend-dot blue" />
            <p>Technical Users</p>
            <strong>{technique}</strong>
          </div>

          <div>
            <span className="admin-legend-dot orange" />
            <p>Functional Users</p>
            <strong>{fonctionnel}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileTrafficChart({ labels, fileIn, fileOut }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "File IN",
            data: fileIn,
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.10)",
            fill: true,
            tension: 0.42,
            borderWidth: 3,
            pointRadius: 3,
            pointBackgroundColor: "#22c55e",
          },
          {
            label: "File OUT",
            data: fileOut,
            borderColor: "#0099ff",
            backgroundColor: "rgba(0,153,255,0.08)",
            fill: true,
            tension: 0.42,
            borderWidth: 3,
            pointRadius: 3,
            pointBackgroundColor: "#0099ff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          legend: {
            labels: {
              color: "rgba(255,255,255,0.75)",
              usePointStyle: true,
              boxWidth: 8,
            },
          },
          tooltip: {
            backgroundColor: "rgba(2,10,18,0.96)",
            borderColor: "rgba(0,255,204,0.22)",
            borderWidth: 1,
            titleColor: "#ffffff",
            bodyColor: "rgba(255,255,255,0.72)",
            padding: 12,
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.035)" },
            ticks: {
              color: "rgba(255,255,255,0.45)",
              font: { size: 10 },
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(255,255,255,0.045)" },
            ticks: {
              color: "rgba(255,255,255,0.45)",
              font: { size: 10 },
            },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [labels, fileIn, fileOut]);

  return (
    <div className="admin-chart-card admin-traffic-card">
      <div className="admin-chart-head">
        <div>
          <h3>File Traffic Overview</h3>
          <p>Read-only File IN vs File OUT volume.</p>
        </div>

        <span className="admin-chart-filter">Last period</span>
      </div>

      <div className="admin-line-chart">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

function PolarOverviewChart({ fileInTotal, fileOutTotal, totalUsers, typeFluxTotal }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const total = fileInTotal + fileOutTotal + totalUsers + typeFluxTotal;

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "polarArea",
      data: {
       labels: ["File IN", "File OUT", "Users", "Flow Types"],
        datasets: [
          {
            data: [fileInTotal, fileOutTotal, totalUsers, typeFluxTotal],
            backgroundColor: [
              "rgba(34,197,94,0.85)",
              "rgba(0,153,255,0.85)",
              "rgba(124,58,237,0.85)",
              "rgba(255,122,0,0.85)",
            ],
            borderColor: "#06111f",
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            grid: { color: "rgba(255,255,255,0.08)" },
            angleLines: { color: "rgba(255,255,255,0.09)" },
            ticks: { display: false },
            pointLabels: { display: false },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(2,10,18,0.96)",
            borderColor: "rgba(0,255,204,0.22)",
            borderWidth: 1,
            titleColor: "#ffffff",
            bodyColor: "rgba(255,255,255,0.72)",
            padding: 12,
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [fileInTotal, fileOutTotal, totalUsers, typeFluxTotal]);

  return (
    <div className="admin-chart-card">
      <div className="admin-chart-head">
        <div>
          <h3>Platform Coverage</h3>
          <p>Global overview across users and flow activity.</p>
        </div>

        <button className="admin-chart-menu">⋮</button>
      </div>

      <div className="admin-polar-layout">
        <div className="admin-polar-wrap">
          <canvas ref={canvasRef} />
        </div>

        <div className="admin-chart-legend admin-polar-legend">
          <div>
            <span className="admin-legend-dot green" />
            <p>File IN</p>
            <strong>{fileInTotal}</strong>
          </div>

          <div>
            <span className="admin-legend-dot blue" />
            <p>File OUT</p>
            <strong>{fileOutTotal}</strong>
          </div>

          <div>
            <span className="admin-legend-dot purple" />
            <p>Users</p>
            <strong>{totalUsers}</strong>
          </div>

          <div>
            <span className="admin-legend-dot orange" />
            <p>Flow Types</p>
            <strong>{typeFluxTotal}</strong>
          </div>
        </div>
      </div>

      <div className="admin-polar-total">
        <span>Global supervised indicators</span>
        <strong>{total}</strong>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());

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

    const refresh = setInterval(() => loadDashboard(true), 60000);
    const clock = setInterval(() => setNow(new Date()), 60000);

    return () => {
      mountedRef.current = false;
      clearInterval(refresh);
      clearInterval(clock);
    };
  }, [loadDashboard]);

  const computed = useMemo(() => {
    const admins = safeNumber(stats?.users?.admin);
    const technique = safeNumber(stats?.users?.technique);
    const fonctionnel = safeNumber(stats?.users?.fonctionnel);

    const labels = Array.isArray(stats?.labels?.trendLabels)
      ? stats.labels.trendLabels
      : [];

    const fileIn = normalizeSeries(stats?.fileIn, labels.length);
    const fileOut = normalizeSeries(stats?.fileOut, labels.length);

    const fileInTotal = sumArray(fileIn);
    const fileOutTotal = sumArray(fileOut);

    const senderTotal =
      safeNumber(stats?.senders?.mft) +
      safeNumber(stats?.senders?.mq) +
      safeNumber(stats?.senders?.pasap);

    const receiverTotal =
      safeNumber(stats?.receivers?.recA) +
      safeNumber(stats?.receivers?.recB) +
      safeNumber(stats?.receivers?.recC);

    const typeFluxTotal =
      safeNumber(stats?.typeFlux?.virement) +
      safeNumber(stats?.typeFlux?.prelevement) +
      safeNumber(stats?.typeFlux?.cheque);

    return {
      admins,
      technique,
      fonctionnel,
      totalUsers: admins + technique + fonctionnel,
      labels,
      fileIn,
      fileOut,
      fileInTotal,
      fileOutTotal,
      totalTraffic: fileInTotal + fileOutTotal,
      senderTotal,
      receiverTotal,
      typeFluxTotal,
    };
  }, [stats]);

  const activities = useMemo(() => {
    const time = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return [
      {
        title: "Users synchronized",
        desc: `${computed.totalUsers} accounts loaded from user service`,
        time,
        type: "purple",
        icon: <Users size={18} />,
      },
      {
        title: "Traffic overview updated",
        desc: `${computed.totalTraffic} global File IN / OUT events supervised`,
        time,
        type: "blue",
        icon: <Activity size={18} />,
      },
      {
        title: "AI health verified",
        desc: "Autoencoder supervision state checked",
        time,
        type: "green",
        icon: <BrainCircuit size={18} />,
      },
      {
        title: "Access control verified",
        desc: "Role-based access remains active",
        time,
        type: "orange",
        icon: <ShieldCheck size={18} />,
      },
    ];
  }, [computed.totalTraffic, computed.totalUsers, now]);

  const kpis = [
    {
      label: "Total Users",
      value: computed.totalUsers,
      sub: "All platform accounts",
      icon: <Users size={24} />,
      cls: "purple",
    },
    {
      label: "File IN Today",
      value: computed.fileInTotal,
      sub: "Total files received",
      icon: <FileInput size={24} />,
      cls: "green",
    },
    {
      label: "File OUT Today",
      value: computed.fileOutTotal,
      sub: "Total files sent",
      icon: <FileOutput size={24} />,
      cls: "orange",
    },
    {
      label: "AI Health",
      value: error ? "Review" : "Healthy",
      sub: error ? "Dashboard degraded" : "No issue detected",
      icon: <BrainCircuit size={24} />,
      cls: "violet",
    },
    {
      label: "Security Status",
      value: "Secure",
      sub: "Role-based access active",
      icon: <ShieldCheck size={24} />,
      cls: "cyan",
    },
  ];

  return (
    <div className="admin-dashboard-page">
      <div className="admin-topbar">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back, Admin. Here’s what’s happening on the platform.</p>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
        >
          <span>
            Last update:{" "}
            {now.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          <RefreshCw size={16} className={refreshing ? "spin" : ""} />
        </button>
      </div>

      {loading && !stats ? (
        <div className="admin-state-card">Loading dashboard...</div>
      ) : error ? (
        <div className="admin-state-card error">
          <strong>Dashboard error:</strong> {error}
        </div>
      ) : !stats ? (
        <div className="admin-state-card">No dashboard data available.</div>
      ) : (
        <>
          <div className="admin-kpi-grid-v2">
            {kpis.map((item) => (
              <div className={`admin-kpi-v2 ${item.cls}`} key={item.label}>
                <div className="admin-kpi-icon-v2">{item.icon}</div>

                <div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-main-grid">
            <UsersByRoleChart
              admins={computed.admins}
              technique={computed.technique}
              fonctionnel={computed.fonctionnel}
            />

            <FileTrafficChart
              labels={computed.labels}
              fileIn={computed.fileIn}
              fileOut={computed.fileOut}
            />
          </div>

          <div className="admin-second-grid">
            <PolarOverviewChart
              fileInTotal={computed.fileInTotal}
              fileOutTotal={computed.fileOutTotal}
              totalUsers={computed.totalUsers}
              typeFluxTotal={computed.typeFluxTotal}
            />

            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h3>Platform Health</h3>
                  <p>Core system status.</p>
                </div>

                <Server size={22} />
              </div>

              <div className="admin-health-list">
                <HealthRow
                  icon={<LockKeyhole size={18} />}
                  label="Authentication"
                  status="Online"
                />
                <HealthRow
                  icon={<Database size={18} />}
                  label="Database"
                  status="Healthy"
                />
                <HealthRow
                  icon={<BrainCircuit size={18} />}
                  label="AI Services"
                  status="Running"
                />
                <HealthRow
                  icon={<Activity size={18} />}
                  label="Traffic Flow"
                  status="Stable"
                />
              </div>
            </div>

            <RecentActivity activities={activities} />
          </div>

          <div className="admin-quick-actions">
            <h3>Quick Actions</h3>

            <div className="admin-actions-grid">
              <Link to="/admin/users" className="admin-action-card">
                <Users size={22} />
                <div>
                  <strong>Users Management</strong>
                  <p>Manage all users and roles</p>
                </div>
              </Link>

              <button className="admin-action-card" type="button">
                <Download size={22} />
                <div>
                  <strong>Export Users</strong>
                  <p>Download users list</p>
                </div>
              </button>

              <button className="admin-action-card" type="button">
                <ClipboardList size={22} />
                <div>
                  <strong>System Reports</strong>
                  <p>View global platform reports</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}