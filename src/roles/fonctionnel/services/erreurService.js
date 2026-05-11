import http from "../../../services/http";

export function getFluxByStatus(status) {
  return http.get(`/flux?status=${status}`);
}

export function forceFlux(appReference) {
  return http.put(`/flux/${appReference}/force`);
}

export function rejectFlux(appReference) {
  return http.put(`/flux/${appReference}/reject`);
}