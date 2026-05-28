import http from "../../../services/http";
import { getToken } from "../../../auth/utils/auth";

const API_BASE_URL = "http://localhost:8080";
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function normalizeArrayPayload(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.content)) return res.data.content;
  return [];
}

function normalizeStats(stats = {}) {
  return {
    total: Number(stats.total ?? 0),
    info: Number(stats.info ?? stats.INFO ?? 0),
    warn: Number(stats.warn ?? stats.warning ?? stats.WARNING ?? 0),
    error: Number(stats.error ?? stats.ERROR ?? 0),
    debug: Number(stats.debug ?? stats.DEBUG ?? 0),
    phases: stats.phases ?? stats.byPhase ?? {},
    lastUpdated: stats.lastUpdated ?? null,
  };
}

function extractTimestamp(item) {
  return (
    item?.timestamp ||
    item?.createdAt ||
    item?.created_at ||
    item?.date ||
    item?.time ||
    item?.loggedAt ||
    item?.logTime ||
    new Date().toISOString()
  );
}

function extractLevel(item) {
  return String(item?.level || "INFO").toUpperCase();
}

function extractPhase(item) {
  return item?.phase || item?.step || item?.module || "GENERAL";
}

function extractMessage(item) {
  return (
    item?.message ||
    item?.details ||
    item?.description ||
    item?.log ||
    JSON.stringify(item)
  );
}

function formatLog(source, item, idx = 0) {
  return {
    id:
      item?.id ||
      `${source}-${extractTimestamp(item) || "no-time"}-${idx}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
    source,
    level: extractLevel(item),
    phase: extractPhase(item),
    message: extractMessage(item),
    timestamp: extractTimestamp(item),
    raw: item,
  };
}

function safeDate(dateLike) {
  const d = new Date(dateLike);
  return Number.isNaN(d.getTime()) ? null : d;
}

function buildSeriesFromLogs(logs, filterFn) {
  const counts = new Array(7).fill(0);

  logs.forEach((log) => {
    if (!filterFn(log)) return;

    const dt = safeDate(log.timestamp);
    if (!dt) return;

    const jsDay = dt.getDay();
    const mapped = jsDay === 0 ? 6 : jsDay - 1;

    counts[mapped] += 1;
  });

  return counts;
}

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export function createLogStream(path, onMessage) {
  const token = getToken();

  const streamUrl = `${buildUrl(path)}${
    token ? `?token=${encodeURIComponent(token)}` : ""
  }`;

  console.log("Opening SSE stream:", streamUrl);

  const eventSource = new EventSource(streamUrl);

  const handleEvent = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      console.log("SSE log event:", parsed);
      onMessage(parsed);
    } catch (err) {
      console.error("SSE parse error:", err, event.data);
    }
  };

  eventSource.onopen = () => {
    console.log("SSE connected:", path);
  };

  eventSource.onmessage = handleEvent;
  eventSource.addEventListener("log", handleEvent);

  eventSource.onerror = (err) => {
    console.error("SSE stream error:", err);
  };

  return eventSource;
}

export async function exportCbrPdf() {
  const response = await http.get(
    buildUrl("/api/reports/cbr/last24h/pdf"),
    {
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data], { type: "application/pdf" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "cbr-report-last24h.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function getGeneratorLogs(params = {}) {
  try {
    const res = await http.get(buildUrl("/api/generator/logs"), {
      params: {
        limit: params.limit ?? 100,
        level: params.level ?? "ALL",
      },
    });

    return normalizeArrayPayload(res).map((item, idx) =>
      formatLog("GENERATOR", item, idx)
    );
  } catch (error) {
    console.error("Failed to load generator logs", error);
    return [];
  }
}

export async function getGeneratorStats() {
  try {
    const res = await http.get(buildUrl("/api/generator/logs/stats"));
    return normalizeStats(res.data);
  } catch (error) {
    console.error("Failed to load generator stats", error);
    return normalizeStats();
  }
}

export async function getAutoencoderLogs(params = {}) {
  try {
    const res = await http.get(buildUrl("/api/autoencoder/logs"), {
      params: {
        limit: params.limit ?? 100,
        level: params.level ?? "ALL",
        phase: params.phase ?? "ALL",
      },
    });

    return normalizeArrayPayload(res).map((item, idx) =>
      formatLog("AUTOENCODER", item, idx)
    );
  } catch (error) {
    console.error("Failed to load autoencoder logs", error);
    return [];
  }
}

export async function getAutoencoderStats() {
  try {
    const res = await http.get(buildUrl("/api/autoencoder/logs/stats"));
    return normalizeStats(res.data);
  } catch (error) {
    console.error("Failed to load autoencoder stats", error);
    return normalizeStats();
  }
}

export async function getTechniqueDashboardData() {
  const [
    sendersRes,
    receiversRes,
    typeFluxRes,
    generatorLogs,
    autoencoderLogs,
    generatorStats,
    autoencoderStats,
  ] = await Promise.all([
    http.get("/senders"),
    http.get("/receivers"),
    http.get("/typeflux"),
    getGeneratorLogs({ limit: 120 }),
    getAutoencoderLogs({ limit: 120 }),
    getGeneratorStats(),
    getAutoencoderStats(),
  ]);

  const senders = normalizeArrayPayload(sendersRes);
  const receivers = normalizeArrayPayload(receiversRes);
  const typeFlux = normalizeArrayPayload(typeFluxRes);

  const mergedLogs = [...generatorLogs, ...autoencoderLogs].sort((a, b) => {
    const da = safeDate(a.timestamp)?.getTime() ?? 0;
    const db = safeDate(b.timestamp)?.getTime() ?? 0;
    return db - da;
  });

  const totalSenders = senders.length;
  const totalReceivers = receivers.length;
  const totalTypeFlux = typeFlux.length;

  const totalLogs = generatorStats.total + autoencoderStats.total;
  const totalErrors = generatorStats.error + autoencoderStats.error;
  const totalWarnings = generatorStats.warn + autoencoderStats.warn;

  const healthyRate =
    totalLogs > 0
      ? `${Math.max(
          0,
          Math.round(((totalLogs - totalErrors) / totalLogs) * 100)
        )}%`
      : "100%";

  const senderOkSeries = buildSeriesFromLogs(
    generatorLogs,
    (log) => !["WARN", "WARNING", "ERROR"].includes(log.level)
  );

  const senderFlaggedSeries = buildSeriesFromLogs(
    generatorLogs,
    (log) => ["WARN", "WARNING", "ERROR"].includes(log.level)
  );

  const autoReceivedSeries = buildSeriesFromLogs(autoencoderLogs, () => true);

  const autoAlertSeries = buildSeriesFromLogs(
    autoencoderLogs,
    (log) => ["WARN", "WARNING", "ERROR"].includes(log.level)
  );

  return {
    labels: DAY_LABELS,

    totalSenders,
    totalReceivers,
    totalTypeFlux,

    stats: {
      totalLogs,
      totalErrors,
      totalWarnings,
      healthyRate,
      generatorCount: generatorStats.total,
      autoencoderCount: autoencoderStats.total,
    },

    generatorStats,
    autoencoderStats,

    logs: mergedLogs.slice(0, 160),

    senderChart: {
      ok: senderOkSeries,
      flagged: senderFlaggedSeries,
    },

    autoencoderChart: {
      received: autoReceivedSeries,
      alerts: autoAlertSeries,
    },
  };
}