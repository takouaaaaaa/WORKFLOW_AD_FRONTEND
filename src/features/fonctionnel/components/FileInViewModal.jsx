export default function FileInViewModal({
  show,
  onClose,
  selectedRow,
  formatDate,
}) {
  if (!show || !selectedRow) return null;

  return (
    <div className="modal fade show d-block filein-modal-backdrop" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content filein-modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title">File IN Details</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            <p><b>ID:</b> {selectedRow.idFluxIn}</p>
            <p><b>Status:</b> {selectedRow.flux?.statut || "—"}</p>
            <p><b>Sender Ref:</b> {selectedRow.flux?.senderReference || "—"}</p>
            <p><b>Sending Date:</b> {formatDate(selectedRow.sendingDate)}</p>
            <p><b>Settlement Date:</b> {formatDate(selectedRow.settlementDate)}</p>
            <p><b>Category:</b> {selectedRow.category || "—"}</p>
            <p><b>Message:</b> {selectedRow.flux?.description || "—"}</p>

            <hr />

            <p><b>App Ref:</b> {selectedRow.appReference || selectedRow.flux?.appReference || "—"}</p>
            <p>
              <b>Flow Type:</b>{" "}
              {selectedRow.flux?.typeFlux?.flowType ||
                selectedRow.flux?.typeFlux?.FlowType ||
                "—"}
            </p>
            <p><b>Sender:</b> {selectedRow.flux?.sender?.sender || "—"}</p>
            <p><b>Total Amount:</b> {selectedRow.flux?.totalAmount ?? "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}