import http from "../../../services/http";

// ───────────────── FILE IN ─────────────────

export function getFileIns(filters = {}) {
  return http.get("/filein", {
    params: {
      appReference: filters.appReference || undefined,
      senderReference: filters.senderReference || undefined,
      status: filters.status || undefined,
      category: filters.category || undefined,
      sender: filters.sender || undefined,
      receiver: filters.receiver || undefined,
      flowType: filters.flowType || undefined,
      sendingDateFrom: filters.sendingDateFrom || undefined,
      sendingDateTo: filters.sendingDateTo || undefined,
      totalAmountFrom: filters.totalAmountFrom || undefined,
      totalAmountTo: filters.totalAmountTo || undefined,
    },
  });
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

// ───────────────── SENDERS ─────────────────

export function getSenders() {
  return http.get("/senders");
}

// ───────────────── RECEIVERS ───────────────

export function getReceivers() {
  return http.get("/receivers");
}

// ───────────────── FLOW TYPES ──────────────

export function getTypeFlux() {
  return http.get("/typeflux");
}