export default function FileInEditModal({ show, onClose, editData, setEditData, onSave }) {
  if (!show) return null;

  return (
    <div className="fi-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fi-modal">
        <div className="fi-modal-header">
          <span className="fi-modal-title">Edit File IN</span>
          <button className="fi-modal-close" onClick={onClose} type="button">✕</button>
        </div>

        <div className="fi-modal-body">

          <div className="fi-field">
            <label className="filein-label">Status</label>
            <select
              className="filein-input"
              value={editData.statutFluxIn || ""}
              onChange={(e) => setEditData((prev) => ({ ...prev, statutFluxIn: e.target.value }))}
            >
              <option value="PROCESSED">PROCESSED</option>
              <option value="INPROCESS">INPROCESS</option>
              <option value="REJECTED">REJECTED</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="INITIATED">INITIATED</option>
            </select>
          </div>

          <div className="fi-field">
            <label className="filein-label">Category</label>
            <select
              className="filein-input"
              value={editData.category || ""}
              onChange={(e) => setEditData((prev) => ({ ...prev, category: e.target.value }))}
            >
              <option value="ACQUISITION">ACQUISITION</option>
              <option value="RESTITUTION">RESTITUTION</option>
            </select>
          </div>

          <div className="fi-field">
            <label className="filein-label">Message</label>
            <textarea
              className="filein-input"
              rows={4}
              value={editData.message || ""}
              onChange={(e) => setEditData((prev) => ({ ...prev, message: e.target.value }))}
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