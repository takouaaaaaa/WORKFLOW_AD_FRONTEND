import { useEffect, useState } from "react";
import axiosInstance from "../services/api";
import { jwtDecode } from "jwt-decode";
import "./Dashboard.css";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setRole(decoded.role);
      setEmail(decoded.sub);
    }
  }, []);

  useEffect(() => {
    if (role === "ADMIN") {
      axiosInstance.get("/users")
        .then((res) => setUsers(res.data))
        .catch(() => setError("Failed to load users"));
    }
  }, [role]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(`/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (role === "ADMIN") {
    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <span className="dashboard-badge">CURE PLATFORM</span>
            <h1 className="dashboard-title">Admin Dashboard</h1>
          </div>
          <button onClick={handleLogout} className="dashboard-logout">Logout</button>
        </header>
        <main className="dashboard-main">
          <h2 className="dashboard-section-title">Users List</h2>
          {error && <div className="dashboard-error">{error}</div>}
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>{user.numTel}</td>
                    <td><span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span></td>
                    <td>
                      <button onClick={() => handleDelete(user.id)} className="delete-button">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-user-page">
      <div className="dashboard-user-card">
        <span className="dashboard-badge">CURE PLATFORM</span>
        <h1 className="dashboard-user-title">Welcome back!</h1>
        <p className="dashboard-user-email">{email}</p>
        <span className={`role-badge role-${role.toLowerCase()}`}>{role}</span>
        <button onClick={handleLogout} className="dashboard-logout-center">Logout</button>
      </div>
    </div>
  );
}