import http from "../../../services/http";

/* =========================================================
   BASIC API CALLS
========================================================= */

export function getAllUsers() {
  return http.get("/users");
}

export function getAllFlux() {
  return http.get("/flux");
}

export function getAllFileIn() {
  return http.get("/filein");
}

export function getAllFileOut() {
  return http.get("/fileout");
}

export function getAllSenders() {
  return http.get("/senders");
}

export function getAllReceivers() {
  return http.get("/receivers");
}

export function getAllTypeFluxes() {
  return http.get("/typeflux");
}

/* =========================================================
   HELPERS
========================================================= */

function safeArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function normalizeText(value) {
  return String(value || "").trim().toUpperCase();
}

function incrementMap(map, key) {
  if (!key) return;
  map[key] = (map[key] || 0) + 1;
}

function getTopThree(map, fallback1, fallback2, fallback3) {
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);

  while (entries.length < 3) {
    if (entries.length === 0) entries.push([fallback1, 0]);
    else if (entries.length === 1) entries.push([fallback2, 0]);
    else entries.push([fallback3, 0]);
  }

  return entries.slice(0, 3);
}

function getSenderName(flux) {
  return (
    flux?.sender?.sender ||
    flux?.sender?.name ||
    flux?.senderReference ||
    "UNKNOWN"
  );
}

function getReceiverName(fileOut) {
  return (
    fileOut?.receiver?.receiver ||
    fileOut?.receiver?.name ||
    "UNKNOWN"
  );
}

function getTypeFluxName(flux) {
  return (
    flux?.typeFlux?.flowType ||
    flux?.flowType?.flowType ||
    flux?.flowType ||
    "UNKNOWN"
  );
}

function getDateValue(item, dateFields = []) {
  for (const field of dateFields) {
    if (item?.[field]) return item[field];
  }
  return null;
}

function formatDateLabel(dateValue) {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function sortDateLabels(labels) {
  return [...labels].sort((a, b) => {
    const [da, ma, ya] = a.split("/").map(Number);
    const [db, mb, yb] = b.split("/").map(Number);

    return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
  });
}

function emptySeries(labels) {
  return labels.map(() => 0);
}

function buildGlobalDateLabels(fileIns, fileOuts) {
  const labelSet = new Set();

  fileIns.forEach((item) => {
    const value = getDateValue(item, [
      "sendingDate",
      "settlementDate",
      "creationDate",
      "updateDate",
    ]);
    const label = formatDateLabel(value);
    if (label) labelSet.add(label);
  });

  fileOuts.forEach((item) => {
    const value = getDateValue(item, ["creationDate", "updateDate", "sendingDate"]);
    const label = formatDateLabel(value);
    if (label) labelSet.add(label);
  });

  return sortDateLabels([...labelSet]);
}

function buildLineSeries(items, labels, dateFields = []) {
  const result = emptySeries(labels);
  const labelIndexMap = {};

  labels.forEach((label, index) => {
    labelIndexMap[label] = index;
  });

  items.forEach((item) => {
    const value = getDateValue(item, dateFields);
    const label = formatDateLabel(value);

    if (!label || labelIndexMap[label] === undefined) return;

    result[labelIndexMap[label]] += 1;
  });

  return result;
}

/* =========================================================
   USERS STATS
========================================================= */

function buildUsersStats(users) {
  let admin = 0;
  let fonctionnel = 0;
  let technique = 0;

  users.forEach((user) => {
    const role = normalizeText(user?.role);

    if (role === "ADMIN" || role === "ROLE_ADMIN") admin += 1;
    else if (role === "USER_FONCTIONNEL" || role === "ROLE_USER_FONCTIONNEL") fonctionnel += 1;
    else if (role === "USER_TECHNIQUE" || role === "ROLE_USER_TECHNIQUE") technique += 1;
  });

  return {
    admin,
    fonctionnel,
    technique,
  };
}

/* =========================================================
   SENDERS STATS
========================================================= */

function buildSendersStats(fluxes) {
  const counts = {};

  fluxes.forEach((flux) => {
    incrementMap(counts, getSenderName(flux));
  });

  const top = getTopThree(counts, "Sender 1", "Sender 2", "Sender 3");

  return {
    senders: {
      mft: top[0][1],
      mq: top[1][1],
      pasap: top[2][1],
    },
    senderLabels: {
      mft: top[0][0],
      mq: top[1][0],
      pasap: top[2][0],
    },
  };
}

function buildSenderTrend(fileIns, senderLabels, allLabels) {
  const mft = emptySeries(allLabels);
  const mq = emptySeries(allLabels);
  const pasap = emptySeries(allLabels);

  const indexMap = {};
  allLabels.forEach((label, index) => {
    indexMap[label] = index;
  });

  fileIns.forEach((fileIn) => {
    const senderName = getSenderName(fileIn?.flux);
    const dateLabel = formatDateLabel(
      getDateValue(fileIn, ["sendingDate", "settlementDate"])
    );

    if (!dateLabel || indexMap[dateLabel] === undefined) return;

    const i = indexMap[dateLabel];

    if (senderName === senderLabels.mft) mft[i] += 1;
    else if (senderName === senderLabels.mq) mq[i] += 1;
    else if (senderName === senderLabels.pasap) pasap[i] += 1;
  });

  return { mft, mq, pasap };
}

/* =========================================================
   RECEIVERS STATS
========================================================= */

function buildReceiversStats(fileOuts) {
  const counts = {};

  fileOuts.forEach((fileOut) => {
    incrementMap(counts, getReceiverName(fileOut));
  });

  const top = getTopThree(counts, "Receiver 1", "Receiver 2", "Receiver 3");

  return {
    receivers: {
      recA: top[0][1],
      recB: top[1][1],
      recC: top[2][1],
    },
    receiverLabels: {
      recA: top[0][0],
      recB: top[1][0],
      recC: top[2][0],
    },
  };
}

function buildReceiverTrend(fileOuts, receiverLabels, allLabels) {
  const recA = emptySeries(allLabels);
  const recB = emptySeries(allLabels);
  const recC = emptySeries(allLabels);

  const indexMap = {};
  allLabels.forEach((label, index) => {
    indexMap[label] = index;
  });

  fileOuts.forEach((fileOut) => {
    const receiverName = getReceiverName(fileOut);
    const dateLabel = formatDateLabel(
      getDateValue(fileOut, ["creationDate", "updateDate"])
    );

    if (!dateLabel || indexMap[dateLabel] === undefined) return;

    const i = indexMap[dateLabel];

    if (receiverName === receiverLabels.recA) recA[i] += 1;
    else if (receiverName === receiverLabels.recB) recB[i] += 1;
    else if (receiverName === receiverLabels.recC) recC[i] += 1;
  });

  return { recA, recB, recC };
}

/* =========================================================
   TYPE FLUX STATS
========================================================= */

function buildTypeFluxStats(fluxes) {
  const counts = {};

  fluxes.forEach((flux) => {
    incrementMap(counts, getTypeFluxName(flux));
  });

  const top = getTopThree(counts, "Type 1", "Type 2", "Type 3");

  return {
    typeFlux: {
      virement: top[0][1],
      prelevement: top[1][1],
      cheque: top[2][1],
    },
    typeLabels: {
      virement: top[0][0],
      prelevement: top[1][0],
      cheque: top[2][0],
    },
  };
}

function buildTypeTrend(fileIns, typeLabels, allLabels) {
  const virement = emptySeries(allLabels);
  const prelevement = emptySeries(allLabels);
  const cheque = emptySeries(allLabels);

  const indexMap = {};
  allLabels.forEach((label, index) => {
    indexMap[label] = index;
  });

  fileIns.forEach((fileIn) => {
    const typeName = getTypeFluxName(fileIn?.flux);
    const dateLabel = formatDateLabel(
      getDateValue(fileIn, ["sendingDate", "settlementDate"])
    );

    if (!dateLabel || indexMap[dateLabel] === undefined) return;

    const i = indexMap[dateLabel];

    if (typeName === typeLabels.virement) virement[i] += 1;
    else if (typeName === typeLabels.prelevement) prelevement[i] += 1;
    else if (typeName === typeLabels.cheque) cheque[i] += 1;
  });

  return { virement, prelevement, cheque };
}

/* =========================================================
   MAIN SERVICE
========================================================= */

export async function getAdminDashboardStats() {
  const [
    usersRes,
    fluxRes,
    fileInRes,
    fileOutRes,
    sendersRes,
    receiversRes,
    typeFluxRes,
  ] = await Promise.all([
    getAllUsers(),
    getAllFlux(),
    getAllFileIn(),
    getAllFileOut(),
    getAllSenders(),
    getAllReceivers(),
    getAllTypeFluxes(),
  ]);

  const users = safeArray(usersRes?.data);
  const fluxes = safeArray(fluxRes?.data);
  const fileIns = safeArray(fileInRes?.data);
  const fileOuts = safeArray(fileOutRes?.data);
  const senders = safeArray(sendersRes?.data);
  const receivers = safeArray(receiversRes?.data);
  const typeFluxes = safeArray(typeFluxRes?.data);

  const usersStats = buildUsersStats(users);

  const { senders: sendersStats, senderLabels } = buildSendersStats(fluxes);
  const { receivers: receiversStats, receiverLabels } = buildReceiversStats(fileOuts);
  const { typeFlux: typeFluxStats, typeLabels } = buildTypeFluxStats(fluxes);

  const trendLabels = buildGlobalDateLabels(fileIns, fileOuts);

  const senderTrend = buildSenderTrend(fileIns, senderLabels, trendLabels);
  const receiverTrend = buildReceiverTrend(fileOuts, receiverLabels, trendLabels);
  const typeTrend = buildTypeTrend(fileIns, typeLabels, trendLabels);

  const fileInTrend = buildLineSeries(fileIns, trendLabels, [
    "sendingDate",
    "settlementDate",
  ]);

  const fileOutTrend = buildLineSeries(fileOuts, trendLabels, [
    "creationDate",
    "updateDate",
  ]);

  return {
    cards: {
      totalUsers: users.length,
      totalFlux: fluxes.length,
      totalFileIn: fileIns.length,
      totalFileOut: fileOuts.length,
      totalSenders: senders.length,
      totalReceivers: receivers.length,
      totalTypeFlux: typeFluxes.length,
    },

    users: usersStats,
    senders: sendersStats,
    receivers: receiversStats,
    typeFlux: typeFluxStats,

    fileIn: fileInTrend,
    fileOut: fileOutTrend,

    senderTrend,
    receiverTrend,
    typeTrend,

    labels: {
      senderLabels,
      receiverLabels,
      typeLabels,
      trendLabels,
    },
  };
}