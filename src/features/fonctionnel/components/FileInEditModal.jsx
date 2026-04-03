export default function FileInEditModal({
  show,
  onClose,
  editData,
  setEditData,
  onSave,
}) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block filein-modal-backdrop" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content filein-modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title">Edit File IN</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label filein-label">Status</label>
              <select
                className="form-select filein-input"
                value={editData.statutFluxIn || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    statutFluxIn: e.target.value,
                  }))
                }
              >
                <option value="PROCESSED">PROCESSED</option>
                <option value="INPROCESS">INPROCESS</option>
                <option value="REJECTED">REJECTED</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="INITIATED">INITIATED</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label filein-label">Category</label>
              <select
                className="form-select filein-input"
                value={editData.category || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              >
                <option value="ACQUISITION">ACQUISITION</option>
                <option value="RESTITUTION">RESTITUTION</option>
              </select>
            </div>

            <div>
              <label className="form-label filein-label">Message</label>
              <textarea
                className="form-control filein-input"
                rows="4"
                value={editData.message || ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="modal-footer border-0">
            <button className="btn filein-btn-primary" onClick={onSave}>
              Save
            </button>
            <button className="btn btn-outline-light" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}