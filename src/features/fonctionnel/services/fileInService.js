import http from "../../../services/http";

export function getFileIns() {
  return http.get("/filein");
}

export function downloadFileIn(id) {
  return http.get(`/filein/${id}/download`, {
    responseType: "blob",
  });
}

export function updateFileIn(id, data) {
  return http.put(`/filein/${id}`, data);
}

export function forceFileIn(id) {
  return http.put(`/filein/${id}/force`);
}

export function rejectFileIn(id) {
  return http.put(`/filein/${id}/reject`);
}