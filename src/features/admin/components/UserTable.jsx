export default function UserTable({ rows, onEdit, onDelete }) {
  return (
    <div className="user-table-wrap">
      <table className="table user-table align-middle">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Prenom</th>
            <th>Email</th>
            <th>Role</th>
            <th style={{ width: "220px" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No users found
              </td>
            </tr>
          ) : (
            rows.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.nom}</td>
                <td>{u.prenom}</td>
                <td>{u.email}</td>
                <td>
                  <span className="user-role-badge">{u.role}</span>
                </td>
                <td>
                  <button
                    className="btn user-btn-edit btn-sm me-2"
                    onClick={() => onEdit(u)}
                  >
                    Edit Role
                  </button>
                  <button
                    className="btn user-btn-delete btn-sm"
                    onClick={() => onDelete(u)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}