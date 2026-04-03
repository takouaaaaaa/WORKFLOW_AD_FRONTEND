export default function AdminInfoPanel({ title, children, wide = false }) {
  return (
    <div className={`admin-panel ${wide ? "wide" : ""}`}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}