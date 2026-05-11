export default function FileInViewModal({ show, onClose, selectedRow, formatDate }) {
  if (!show || !selectedRow) return null;

  const rows = [
    { label: "ID",              value: selectedRow.idFluxIn },
    { label: "Status",          value: selectedRow.status || "—" },
    { label: "Sender Ref",      value: selectedRow.flux?.senderReference || "—" },
    { label: "Sending Date",    value: formatDate(selectedRow.sendingDate) },
    { label: "Settlement Date", value: formatDate(selectedRow.settlementDate) },
    { label: "Category",        value: selectedRow.category || "—" },
    { label: "Description",     value: selectedRow.descriptionFileIn || "—" },
  ];

  const rows2 = [
    { label: "App Ref",   value: selectedRow.appReference || "—" },
    { label: "Flow Type", value: selectedRow.flux?.typeFlux?.flowType || selectedRow.flux?.typeFlux?.FlowType || "—" },
    { label: "Sender",    value: selectedRow.flux?.sender?.sender || "—" },
    { label: "Amount",    value: selectedRow.flux?.totalAmount ?? "—" },
  ];

  return (
    <div className="fi-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fi-modal wide">
        <div className="fi-modal-header">
          <span className="fi-modal-title">File IN Details</span>
          <button className="fi-modal-close" onClick={onClose} type="button">✕</button>
        </div>
        <div className="fi-modal-body">
          {rows.map((r) => (
            <div className="fi-detail-row" key={r.label}>
              <b>{r.label}</b>
              <span>{r.value}</span>
            </div>
          ))}
          <div className="fi-divider" />
          {rows2.map((r) => (
            <div className="fi-detail-row" key={r.label}>
              <b>{r.label}</b>
              <span>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}