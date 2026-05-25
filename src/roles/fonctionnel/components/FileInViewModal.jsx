export default function FileInViewModal({
  show,
  onClose,
  selectedRow,
  formatDate,
}) {
  if (!show || !selectedRow) return null;

  const safeDate = (date) => {
    if (!date) return "—";
    return formatDate ? formatDate(date) : new Date(date).toLocaleString("fr-FR");
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || amount === "") return "—";

    return Number(amount).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const rows = [
    {
      label: "ID",
      value: selectedRow.idFlux || selectedRow.idFluxIn || selectedRow.id || "—",
    },
    {
      label: "Status",
      value: selectedRow.status || "—",
    },
    {
      label: "Sender Ref",
      value:
        selectedRow.senderReference ||
        selectedRow.flux?.senderReference ||
        "—",
    },
    {
      label: "Sending Date",
      value: safeDate(selectedRow.sendingDate),
    },
    {
      label: "Settlement Date",
      value: safeDate(selectedRow.settlementDate),
    },
    {
      label: "Category",
      value: selectedRow.category || "—",
    },
    {
      label: "Description",
      value: selectedRow.descriptionFileIn || selectedRow.description || "—",
    },
  ];

  const rows2 = [
    {
      label: "App Ref",
      value: selectedRow.appReference || "—",
    },
    {
      label: "Flow Type",
      value:
        selectedRow.flowType ||
        selectedRow.flux?.typeFlux?.flowType ||
        selectedRow.flux?.typeFlux?.FlowType ||
        "—",
    },
    {
      label: "Sender",
      value:
        selectedRow.senderName ||
        selectedRow.flux?.sender?.sender ||
        "—",
    },
    {
      label: "Amount",
      value: formatAmount(
        selectedRow.totalAmount ?? selectedRow.flux?.totalAmount
      ),
    },
  ];

  return (
    <div
      className="fi-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="fi-modal wide">
        <div className="fi-modal-header">
          <div>
            <span className="fi-modal-title">File IN Details</span>
            <p className="fi-modal-subtitle">
              {selectedRow.appReference || "File IN information"}
            </p>
          </div>

          <button
            className="fi-modal-close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="fi-modal-body">
          {rows.map((r) => (
            <div
              className={`fi-detail-row ${
                r.label === "Description" ? "fi-detail-wide" : ""
              }`}
              key={r.label}
            >
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