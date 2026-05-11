import http from "../../../services/http";

export function getTypeFluxes() {
  return http.get("/typeflux");
}

export function addTypeFlux(data) {
  return http.post("/typeflux", data);
}

export function updateTypeFlux(id, data) {
  return http.put(`/typeflux/${id}`, data);
}

export function deleteTypeFlux(id) {
  return http.delete(`/typeflux/${id}`);
}