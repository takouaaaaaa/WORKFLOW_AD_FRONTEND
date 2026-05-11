export default function FileInEditModal({ show, onClose, editData, setEditData, onSave }) {
  if (!show) return null;

  const set = (field) => (e) =>
    setEditData((prev) => ({ ...prev, [field]: e.target.value }));

  const toDateTimeLocal = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d)) return "";
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  return (
    <div className="fi-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fi-modal">
        <div className="fi-modal-header">
          <span className="fi-modal-title">Edit File IN</span>
          <button className="fi-modal-close" onClick={onClose} type="button">✕</button>
        </div>

        <div className="fi-modal-body">

          {/* Status — StatutFileIn enum values only */}
          <div className="fi-field">
            <label className="filein-label">Status</label>
            <select className="filein-input" value={editData.status || ""} onChange={set("status")}>
              <option value="">-- Select --</option>
              <option value="INIT">INIT</option>
              <option value="INPROCESS">INPROCESS</option>
              <option value="PROCESSED">PROCESSED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="ARCHIVED">ARCHIVED</option>
              <option value="INTECHNICALERROR">INTECHNICALERROR</option>
              <option value="INBUSINESSERROR">INBUSINESSERROR</option>
              <option value="WAITACTION">WAITACTION</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="CANCELED">CANCELED</option>
            </select>
          </div>

          {/* Category — Category enum */}
          <div className="fi-field">
            <label className="filein-label">Category</label>
            <select className="filein-input" value={editData.category || ""} onChange={set("category")}>
              <option value="">-- Select --</option>
              <option value="ACQUISITION">ACQUISITION</option>
              <option value="RESTITUTION">RESTITUTION</option>
            </select>
          </div>

          {/* Flux fields (read-only context, editable via flux update if backend supports it) */}
          <div className="fi-field">
            <label className="filein-label">Sender Reference</label>
            <input
              className="filein-input"
              type="text"
              value={editData.senderReference || ""}
              onChange={set("senderReference")}
              placeholder="Sender reference"
            />
          </div>

          <div className="fi-field">
            <label className="filein-label">Total Amount</label>
            <input
              className="filein-input"
              type="number"
              step="0.01"
              min="0"
              value={editData.totalAmount ?? ""}
              onChange={set("totalAmount")}
              placeholder="0.00"
            />
          </div>

          <div className="fi-field">
            <label className="filein-label">Sending Date</label>
            <input
              className="filein-input"
              type="datetime-local"
              value={toDateTimeLocal(editData.sendingDate)}
              onChange={set("sendingDate")}
            />
          </div>

          <div className="fi-field">
            <label className="filein-label">Settlement Date</label>
            <input
              className="filein-input"
              type="datetime-local"
              value={toDateTimeLocal(editData.settlementDate)}
              onChange={set("settlementDate")}
            />
          </div>

          {/* descriptionFileIn lives directly on FileIn */}
          <div className="fi-field">
            <label className="filein-label">Description</label>
            <textarea
              className="filein-input"
              rows={3}
              value={editData.descriptionFileIn || ""}
              onChange={set("descriptionFileIn")}
            />
          </div>

        </div>

        <div className="fi-modal-footer">
          <button className="fi-btn-cancel" type="button" onClick={onClose}>Cancel</button>
          <button className="fi-btn-save" type="button" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}