export default function AddUserModal({ show, onClose, form, setForm, onSave }) {
  if (!show) return null;

  return (
    <div className="um-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="um-modal">

        <div className="um-modal-header">
          <span className="um-modal-title">Add User</span>
          <button className="um-modal-close" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="um-modal-body">

          <div className="um-field">
            <label className="um-label">Email</label>
            <input
              className="um-input"
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="um-field">
            <label className="um-label">Password</label>
            <input
              className="um-input"
              type="password"
              placeholder="Min 8 chars"
              value={form.motDePasse}
              onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
            />
          </div>

          <div className="um-field">
            <label className="um-label">Phone Number</label>
            <input
              className="um-input"
              type="tel"
              placeholder="12345678"
              value={form.numTel}
              onChange={(e) => setForm({ ...form, numTel: e.target.value })}
            />
          </div>

          <div className="um-field">
            <label className="um-label">Role</label>
            <select
              className="um-select"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              
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
            Add User
          </button>
        </div>

      </div>
    </div>
  );
}