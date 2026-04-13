import { useEffect, useMemo, useState } from "react";
import {
  getUsers,
  registerUser,
  updateUserRole,
  deleteUser,
} from "../services/adminUserService";

import UserTable from "../components/UserTable";
import AddUserModal from "../components/AddUserModal";
import EditRoleModal from "../components/EditRoleModal";
import "../styles/userManagementPage.css";

const ITEMS_PER_PAGE = 10;

export default function UserManagementPage() {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [registerForm, setRegisterForm] = useState({
    email: "",
    motDePasse: "",
    numTel: "",
    role: "USER_FONCTIONNEL",
  });

  const [roleForm, setRoleForm] = useState({ role: "USER_FONCTIONNEL" });

  useEffect(() => { fetchData(); }, []);

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

  const handleAddUser = async () => {
    try {
      await registerUser({
        email: registerForm.email,
        motDePasse: registerForm.motDePasse,
        numTel: Number(registerForm.numTel),
        role: registerForm.role,
      });
      setShowAddModal(false);
      setRegisterForm({ email: "", motDePasse: "", numTel: "", role: "USER_FONCTIONNEL" });
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Error adding user");
    }
  };

  const handleUpdateRole = async () => {
    try {
      await updateUserRole(selectedUser.id, roleForm.role);
      setShowRoleModal(false);
      setSelectedUser(null);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Error updating role");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete user "${user.email}"?`)) return;
    await deleteUser(user.id);
    fetchData();
  };

  return (
    <div className="user-management-page">

      {/* Page header card */}
      <div className="user-card">
        <div className="user-card-header">
          <span>Users Management</span>
        </div>
        <div
          className="user-card-body"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h4>Users Management</h4>
            <p>Add users, update roles, and manage platform access.</p>
          </div>
          <button
            className="btn-primary-action"
            onClick={() => setShowAddModal(true)}
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="user-card">
        <div className="user-card-header">
          <span>Users List</span>
          <span className="results-badge">{rows.length.toLocaleString()} results</span>
        </div>

        <div className="user-card-body">
          <UserTable
            rows={paginatedRows}
            onEdit={(u) => {
              setSelectedUser(u);
              setRoleForm({ role: u.role || "USER_FONCTIONNEL" });
              setShowRoleModal(true);
            }}
            onDelete={handleDeleteUser}
          />

          <div className="user-pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span>Page {currentPage} / {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <AddUserModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        form={registerForm}
        setForm={setRegisterForm}
        onSave={handleAddUser}
      />

      <EditRoleModal
        show={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        user={selectedUser}
        form={roleForm}
        setForm={setRoleForm}
        onSave={handleUpdateRole}
      />
    </div>
  );
}