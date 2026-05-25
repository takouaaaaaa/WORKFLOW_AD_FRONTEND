// dashboardService.js for FonctionnelDashboard
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

// ── CBR Log endpoints ─────────────────────────────────────────────────

/**
 * Fetch all CBR log entries (optionally filtered).
 * @param {number}  limit   - max entries to return (default 200)
 * @param {string}  level   - INFO | WARNING | ERROR | ALL
 * @param {string}  phase   - DECISION | RETAIN | SEED | STARTUP | ALL
 * @param {string}  verdict - REJECTED | WAITFUNCTIONAL | WAITPROCESS | ALL
 */
export function getCbrLogs({ limit = 200, level = "ALL", phase = "ALL", verdict = "ALL" } = {}) {
  return http.get("/api/cbr/logs", { params: { limit, level, phase, verdict } });
}

/**
 * Fetch WAITFUNCTIONAL entries only — used for the functional-user notifications.
 */
export function getCbrWaitFunctional() {
  return http.get("/api/cbr/logs", { params: { limit: 50, verdict: "WAITFUNCTIONAL" } });
}

/**
 * Fetch aggregated CBR statistics.
 */
export function getCbrStats() {
  return http.get("/api/cbr/logs/stats");
}