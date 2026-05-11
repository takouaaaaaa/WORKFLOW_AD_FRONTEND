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

export function getDetectionStats() {
  return http.get("/api/detection/stats");
}

export function getDetectionAnomalies() {
  return http.get("/api/detection/anomalies");
}