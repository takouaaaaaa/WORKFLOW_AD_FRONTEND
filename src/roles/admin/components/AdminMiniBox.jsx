export default function AdminMiniBox({ label, value }) {
  return (
    <div className="mini-box">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}