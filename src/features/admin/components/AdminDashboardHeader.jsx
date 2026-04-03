export default function AdminDashboardHeader({ title, subtitle }) {
  return (
    <div className="admin-dashboard-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}