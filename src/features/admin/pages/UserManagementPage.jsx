import { useEffect, useMemo, useState } from "react";
import {
  getUsers,
  registerUser,
  updateUserRole,
  deleteUser,
} from "../services/adminUserService";
import "../../fonctionnel/pages/FileInPage.css";

const ITEMS_PER_PAGE = 10;

export default function UserManagementPage() {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [registerForm, setRegisterForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    role: "USER_FONCTIONNEL",
  });

  const [roleForm, setRoleForm] = useState({
    role: "USER_FONCTIONNEL",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getUsers();
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setRows(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load users");
    }
  };

  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE) || 1;

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return rows.slice(start, start + ITEMS_PER_PAGE);
  }, [rows, currentPage]);

  const handleOpenAdd = () => {
    setRegisterForm({
      nom: "",
      prenom: "",
      email: "",
      motDePasse: "",
      role: "USER_FONCTIONNEL",
    });
    setShowAddModal(true);
  };

  const handleOpenRoleEdit = (user) => {
    setSelectedUser(user);
    setRoleForm({
      role: user.role || "USER_FONCTIONNEL",
    });
    setShowRoleModal(true);
  };

  const handleAddUser = async () => {
    if (
      !registerForm.nom.trim() ||
      !registerForm.prenom.trim() ||
      !registerForm.email.trim() ||
      !registerForm.motDePasse.trim()
    ) {
      alert("All fields are required");
      return;
    }

    try {
      await registerUser(registerForm);
      alert("User added successfully");
      setShowAddModal(false);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to add user");
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      await updateUserRole(selectedUser.id, roleForm.role);
      alert("Role updated successfully");
      setShowRoleModal(false);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to update role");
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(`Delete user "${user.email}" ?`);
    if (!confirmed) return;

    try {
      await deleteUser(user.id);
      alert("User deleted successfully");
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    }
  };

  return (
    <div className="filein-page">
      <div className="filein-search-card">
        <div className="filein-card-title">Users Management</div>

        <div className="filein-search-actions" style={{ paddingTop: "16px" }}>
          <div />
          <button className="btn search" onClick={handleOpenAdd}>
            + Add User
          </button>
        </div>
      </div>

      <div className="filein-result-card">
        <div className="filein-card-title">Users List</div>

        <div className="filein-table-wrapper">
          <table className="filein-table">
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
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="6">No user found</td>
                </tr>
              ) : (
                paginatedRows.map((user) => (
                  <tr key={user.id}>
                    <td className="mono">{user.id}</td>
                    <td>{user.nom}</td>
                    <td>{user.prenom}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="status-badge inprocess">
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn"
                          onClick={() => handleOpenRoleEdit(user)}
                        >
                          Edit Role
                        </button>
                        <button
                          className="action-btn danger"
                          onClick={() => handleDeleteUser(user)}
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

        <div className="filein-footer">
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="preview-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>Add User</h3>
              <button onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <div className="modal-content">
              <label>Nom</label>
              <input
                type="text"
                value={registerForm.nom}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, nom: e.target.value }))
                }
              />

              <label>Prenom</label>
              <input
                type="text"
                value={registerForm.prenom}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, prenom: e.target.value }))
                }
              />

              <label>Email</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />

              <label>Password</label>
              <input
                type="password"
                value={registerForm.motDePasse}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, motDePasse: e.target.value }))
                }
              />

              <label>Role</label>
              <select
                value={registerForm.role}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, role: e.target.value }))
                }
              >
                <option value="ADMIN">ADMIN</option>
                <option value="USER_TECHNIQUE">USER_TECHNIQUE</option>
                <option value="USER_FONCTIONNEL">USER_FONCTIONNEL</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="action-btn" onClick={handleAddUser}>
                Save
              </button>
              <button
                className="action-btn danger"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && selectedUser && (
        <div className="preview-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>Edit Role</h3>
              <button onClick={() => setShowRoleModal(false)}>✕</button>
            </div>

            <div className="modal-content">
              <p>
                <b>User:</b> {selectedUser.email}
              </p>

              <label>Role</label>
              <select
                value={roleForm.role}
                onChange={(e) =>
                  setRoleForm((prev) => ({ ...prev, role: e.target.value }))
                }
              >
                <option value="ADMIN">ADMIN</option>
                <option value="USER_TECHNIQUE">USER_TECHNIQUE</option>
                <option value="USER_FONCTIONNEL">USER_FONCTIONNEL</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="action-btn" onClick={handleUpdateRole}>
                Save
              </button>
              <button
                className="action-btn danger"
                onClick={() => setShowRoleModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}