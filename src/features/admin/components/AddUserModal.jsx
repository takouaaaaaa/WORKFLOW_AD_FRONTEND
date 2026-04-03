export default function AddUserModal({ show, onClose, form, setForm, onSave }) {
  if (!show) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-75">
      <div className="modal-dialog">
        <div className="modal-content bg-dark text-light">

          <div className="modal-header">
            <h5>Add User</h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <input className="form-control mb-2" placeholder="Nom"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />

            <input className="form-control mb-2" placeholder="Prenom"
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            />

            <input className="form-control mb-2" placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input type="password" className="form-control mb-2" placeholder="Password"
              value={form.motDePasse}
              onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
            />

            <select className="form-select"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option>ADMIN</option>
              <option>USER_TECHNIQUE</option>
              <option>USER_FONCTIONNEL</option>
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