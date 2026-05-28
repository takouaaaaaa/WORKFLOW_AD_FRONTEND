// dashboardService.js
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

// ─────────────────────────────────────────────
// CBR notifications for USER_FONCTIONNEL
// ─────────────────────────────────────────────

export function getCbrWaitFunctional() {
  return http.get("/api/cbr/logs", {
    params: {
      limit: 50,
      verdict: "WAITFUNCTIONAL",
    },
  });
}

// ─────────────────────────────────────────────
// CBR logs
// ─────────────────────────────────────────────

export function getCbrLogs({
  limit = 200,
  level = "ALL",
  phase = "ALL",
  verdict = "ALL",
} = {}) {
  return http.get("/api/cbr/logs", {
    params: {
      limit,
      level,
      phase,
      verdict,
    },
  });
}

export function getCbrStats() {
  return http.get("/api/cbr/logs/stats");
}