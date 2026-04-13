export default function UserTable({ rows, onEdit, onDelete }) {
  const roleClass = (role) => {
    switch (role) {
      case "ADMIN":           return "processed";
      case "USER_TECHNIQUE":  return "wait";
      case "USER_FONCTIONNEL":return "inprocess";
      default:                return "error";
    }
  };

  const roleLabel = (role) => {
    switch (role) {
      case "ADMIN":           return "Admin";
      case "USER_TECHNIQUE":  return "Technique";
      case "USER_FONCTIONNEL":return "Fonctionnel";
      default:                return role;
    }
  };

  return (
    <div className="user-table-wrap">
      <table className="user-table">
        <thead>
          <tr>
            <th style={{ width: "60px" }}>ID</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th style={{ width: "180px" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "rgba(255,255,255,0.2)",
                  fontSize: "13px",
                }}
              >
                No users found
              </td>
            </tr>
          ) : (
            rows.map((u) => (
              <tr key={u.id}>
                <td className="mono">{u.id}</td>
                <td className="col-email">{u.email}</td>
                <td className="col-phone">{u.numTel ?? "—"}</td>
                <td>
                  <span className={`status-badge ${roleClass(u.role)}`}>
                    {roleLabel(u.role)}
                  </span>
                </td>
                <td>
                  <div className="user-actions">
                    <button
                      className="user-btn-edit"
                      onClick={() => onEdit(u)}
                    >
                      Edit Role
                    </button>
                    <button
                      className="user-btn-delete"
                      onClick={() => onDelete(u)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}