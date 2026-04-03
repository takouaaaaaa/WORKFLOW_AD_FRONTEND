export default function AdminStatCard({ icon, label, value }) {
  return (
    <div className="admin-stat-card d-flex align-items-center">
      <div className="admin-stat-icon flex-shrink-0">{icon}</div>

      <div className="admin-stat-content">
        <span className="admin-stat-label">{label}</span>
        <h2>{value}</h2>
      </div>
    </div>
  );
}