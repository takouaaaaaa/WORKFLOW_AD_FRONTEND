import http from "../../../services/http";

function buildSevenDaySeries(baseValue, variance = 0.12) {
  const safeBase = Math.max(1, Number(baseValue) || 1);
  const seed = Date.now();

  return Array.from({ length: 7 }, (_, i) => {
    const modifier = 1 + Math.sin(i * 0.9 + seed * 0.0001) * variance;
    return Math.max(0, Math.round(safeBase * modifier));
  });
}

export async function getGeneratorLogs() {
  try {
    const res = await axios.get("http://localhost:8082/logs/generator");
    return res.data;
  } catch {
    return [];
  }
}
export async function getTechniqueDashboardData() {
  const [sendersRes, receiversRes, typeFluxRes] = await Promise.all([
    http.get("/senders"),
    http.get("/receivers"),
    http.get("/typeflux"),
  ]);

  const senders = Array.isArray(sendersRes.data)
    ? sendersRes.data
    : sendersRes.data?.content || [];

  const receivers = Array.isArray(receiversRes.data)
    ? receiversRes.data
    : receiversRes.data?.content || [];

  const typeFlux = Array.isArray(typeFluxRes.data)
    ? typeFluxRes.data
    : typeFluxRes.data?.content || [];

  const totalSenders = senders.length;
  const totalReceivers = receivers.length;
  const totalTypeFlux = typeFlux.length;

  const aiDecisions = totalSenders + totalReceivers;
  const manualReviews = Math.max(0, Math.round(totalTypeFlux * 0.25));
  const learnedPatterns = Math.max(1, Math.round(totalTypeFlux * 0.65));
  const confidenceAvg = totalTypeFlux > 0 ? "94.6%" : "0%";

  return {
    totalSenders,
    totalReceivers,
    totalTypeFlux,

    stats: {
      aiDecisions,
      manualReviews,
      learnedPatterns,
      confidenceAvg,
    },

    senderChart: {
      ok: buildSevenDaySeries(totalSenders || 5, 0.18),
      flagged: buildSevenDaySeries(Math.max(1, Math.round(totalSenders * 0.18)), 0.22),
    },

    receiverChart: {
      received: buildSevenDaySeries(totalReceivers || 5, 0.14),
      processed: buildSevenDaySeries(
        Math.max(1, Math.round(totalReceivers * 0.9)),
        0.12
      ),
    },
  };
}