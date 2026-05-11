import http from "../../../services/http";

export function getReceivers() {
  return http.get("/receivers");
}

export function addReceiver(data) {
  return http.post("/receivers", data);
}

export function updateReceiver(id, data) {
  return http.put(`/receivers/${id}`, data);
}

export function deleteReceiver(id) {
  return http.delete(`/receivers/${id}`);
}