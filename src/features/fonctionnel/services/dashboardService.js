import http from "../../../services/http";

export function getAllFlux() {
  return http.get("/flux");
}

export function getAllFileIn() {
  return http.get("/filein");
}

export function getAllFileOut() {
  return http.get("/fileout");
}