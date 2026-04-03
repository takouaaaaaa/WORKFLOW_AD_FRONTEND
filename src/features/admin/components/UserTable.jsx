export default function UserTable({ rows, onEdit, onDelete }) {
  const roleClass = (role) => {
    switch (role) {
      case "ADMIN":
        return "processed";
      case "USER_TECHNIQUE":
        return "wait";
      case "USER_FONCTIONNEL":
        return "inprocess";
      default:
        return "error";
    }
  };

  return (
    <div className="user-table-wrap">
      <table className="table user-table align-middle">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Role</th>
            <th style={{ width: "220px" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No users found
              </td>
            </tr>
          ) : (
            rows.map((u) => (
              <tr key={u.id}>
                <td className="mono">{u.id}</td>
                <td>{u.email}</td>
                <td>{u.numTel}</td>
                <td>
                  <span className={`status-badge ${roleClass(u.role)}`}>
                    {u.role}
                  </span>
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