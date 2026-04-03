import http from "../../../services/http";

export function getSenders() {
  return http.get("/senders");
}

export function addSender(data) {
  return http.post("/senders", data);
}

export function updateSender(id, data) {
  return http.put(`/senders/${id}`, data);
}

export function deleteSender(id) {
  return http.delete(`/senders/${id}`);
}