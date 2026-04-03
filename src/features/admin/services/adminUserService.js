import http from "../../../services/http";

export function getUsers() {
  return http.get("/users");
}

export function registerUser(data) {
  return http.post("/users/register", data);
}

export function updateUserRole(id, role) {
  return http.put(`/users/${id}/role`, { role });
}

export function deleteUser(id) {
  return http.delete(`/users/${id}`);
}