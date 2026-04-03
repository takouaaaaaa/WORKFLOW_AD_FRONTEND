export default function EditRoleModal({
  show,
  onClose,
  user,
  form,
  setForm,
  onSave,
}) {
  if (!show || !user) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-75">
      <div className="modal-dialog">
        <div className="modal-content bg-dark text-light">
          <div className="modal-header">
            <h5>Edit Role</h5>
            <button
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            <p>
              <b>User:</b> {user.email}
            </p>

            <select
              className="form-select"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="USER_TECHNIQUE">USER_TECHNIQUE</option>
              <option value="USER_FONCTIONNEL">USER_FONCTIONNEL</option>
            </select>
          </div>

          <div className="modal-footer">
            <button className="btn btn-success" onClick={onSave}>
              Save
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}