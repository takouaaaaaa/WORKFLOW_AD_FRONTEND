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

  const handleAddUser = async () => {
    try {
      await registerUser(registerForm);
      setShowAddModal(false);
      fetchData();
    } catch (e) {
      alert("Error adding user");
    }
  };

  const handleUpdateRole = async () => {
    try {
      await updateUserRole(selectedUser.id, roleForm.role);
      setShowRoleModal(false);
      fetchData();
    } catch (e) {
      alert("Error updating role");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete user "${user.email}" ?`)) return;
    await deleteUser(user.id);
    fetchData();
  };

  return (
    <div className="container-fluid user-management-page">
      <div className="user-card mb-4">
        <div className="user-card-header d-flex justify-content-between align-items-center">
          <span>Users Management</span>
        </div>
        <div className="user-card-body d-flex justify-content-end">
          <button
            className="btn user-btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Add User
          </button>
        </div>
      </div>

      <div className="user-card">
        <div className="user-card-header">Users List</div>
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

          <div className="d-flex justify-content-between align-items-center mt-3 user-pagination">
            <button
              className="btn btn-outline-light"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>

            <span>
              Page {currentPage} / {totalPages}
            </span>

            <button
              className="btn btn-outline-light"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
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