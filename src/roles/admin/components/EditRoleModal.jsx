export default function EditRoleModal({ show, onClose, user, form, setForm, onSave }) {
  if (!show) return null;

  return (
    <div className="um-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="um-modal">

        <div className="um-modal-header">
          <span className="um-modal-title">Edit Role</span>
          <button className="um-modal-close" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="um-modal-body">

          {user && (
            <div className="um-field">
              <label className="um-label">User</label>
             <div
  style={{
    padding: "11px 14px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(98,255,255,0.14)",
    borderRadius: "11px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: "0.02em",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
  }}
>
  {user.email}
</div>
            </div>
          )}

          <div className="um-field">
            <label className="um-label">New Role</label>
            <select
              className="um-select"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="ADMIN">Admin</option>
              <option value="USER_TECHNIQUE">Technical</option>
              <option value="USER_FONCTIONNEL">Functional</option>
            </select>
          </div>

        </div>

        <div className="um-modal-footer">
          <button className="um-btn-cancel" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="um-btn-save" type="button" onClick={onSave}>
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}