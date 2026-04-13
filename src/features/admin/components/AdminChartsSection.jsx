import { useEffect, useMemo, useRef } from "react";
import {
  Chart,
  DoughnutController,
  LineController,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
} from "chart.js";

Chart.register(
  DoughnutController,
  LineController,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip
);

function normalizeSeries(series, targetLength) {
  const arr = Array.isArray(series) ? series : [];
  if (targetLength <= 0) return arr;

  if (arr.length === targetLength) return arr;

  if (arr.length > targetLength) {
    return arr.slice(0, targetLength);
  }

  return [...arr, ...new Array(targetLength - arr.length).fill(0)];
}

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function DonutCard({ id, title, sub, total, totalLabel, data, colors, legend }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ref.current, {
      type: "doughnut",
      data: {
        labels: legend.map((l) => l.label),
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`,
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, colors, legend]);

  return (
    <div className="acd-card">
      <div className="acd-card-title">{title}</div>
      <div className="acd-card-sub">{sub}</div>

      <div className="acd-donut-wrap">
        <canvas ref={ref} id={id} role="img" aria-label={title} />
        <div className="acd-donut-center">
          <span className="acd-donut-num">{total}</span>
          <span className="acd-donut-lbl">{totalLabel}</span>
        </div>
      </div>

      <div className="acd-legend-list">
        {legend.map((item) => (
          <div className="acd-legend-row" key={item.label}>
            <span className="acd-legend-left">
              <span className="acd-legend-sq" style={{ background: item.color }} />
              {item.label}
            </span>
            <span className="acd-legend-pct" style={{ color: item.color }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineCard({ id, title, sub, legend, datasets, xLabels }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels: xLabels,
        datasets: datasets.map((ds) => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.color,
          backgroundColor: ds.color + "18",
          borderWidth: 2,
          tension: 0.45,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: ds.color,
          borderDash: ds.dash || [],
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(5,13,26,0.92)",
            borderColor: "rgba(99,90,240,0.3)",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            titleColor: "#e2e8f0",
            bodyColor: "#64748b",
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.04)" },
            ticks: {
              font: { size: 10 },
              color: "#475569",
              maxRotation: 45,
              minRotation: 45,
            },
            border: { color: "rgba(99,90,240,0.15)" },
          },
          y: {
            grid: { color: "rgba(255,255,255,0.04)" },
            ticks: { font: { size: 10 }, color: "#475569", maxTicksLimit: 5 },
            border: { display: false },
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [datasets, xLabels]);

  return (
    <div className="acd-card">
      <div className="acd-line-header">
        <div>
          <div className="acd-card-title">{title}</div>
          <div className="acd-card-sub">{sub}</div>
        </div>

        <div className="acd-inline-legend">
          {legend.map((item) => (
            <span className="acd-il-item" key={item.label}>
              <span
                className="acd-il-sq"
                style={{
                  background: item.color,
                  borderRadius: item.circle ? "50%" : "2px",
                }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="acd-chart-h">
        <canvas ref={ref} id={id} role="img" aria-label={title} />
      </div>
    </div>
  );
}

export default function AdminChartsSection({ stats = {} }) {
  const labels = stats.labels || {};

  const userStats = {
    admin: safeNumber(stats?.users?.admin),
    fonctionnel: safeNumber(stats?.users?.fonctionnel),
    technique: safeNumber(stats?.users?.technique),
  };

  const senderStats = {
    mft: safeNumber(stats?.senders?.mft),
    mq: safeNumber(stats?.senders?.mq),
    pasap: safeNumber(stats?.senders?.pasap),
  };

  const receiverStats = {
    recA: safeNumber(stats?.receivers?.recA),
    recB: safeNumber(stats?.receivers?.recB),
    recC: safeNumber(stats?.receivers?.recC),
  };

  const typeStats = {
    virement: safeNumber(stats?.typeFlux?.virement),
    prelevement: safeNumber(stats?.typeFlux?.prelevement),
    cheque: safeNumber(stats?.typeFlux?.cheque),
  };

  const trendLabels = Array.isArray(labels.trendLabels) ? labels.trendLabels : [];

  const senderLabels = labels.senderLabels || {
    mft: "Sender 1",
    mq: "Sender 2",
    pasap: "Sender 3",
  };

  const receiverLabels = labels.receiverLabels || {
    recA: "Receiver 1",
    recB: "Receiver 2",
    recC: "Receiver 3",
  };

  const typeLabels = labels.typeLabels || {
    virement: "Type 1",
    prelevement: "Type 2",
    cheque: "Type 3",
  };

  const senderTrend = {
    mft: normalizeSeries(stats?.senderTrend?.mft, trendLabels.length),
    mq: normalizeSeries(stats?.senderTrend?.mq, trendLabels.length),
    pasap: normalizeSeries(stats?.senderTrend?.pasap, trendLabels.length),
  };

  const receiverTrend = {
    recA: normalizeSeries(stats?.receiverTrend?.recA, trendLabels.length),
    recB: normalizeSeries(stats?.receiverTrend?.recB, trendLabels.length),
    recC: normalizeSeries(stats?.receiverTrend?.recC, trendLabels.length),
  };

  const typeTrend = {
    virement: normalizeSeries(stats?.typeTrend?.virement, trendLabels.length),
    prelevement: normalizeSeries(stats?.typeTrend?.prelevement, trendLabels.length),
    cheque: normalizeSeries(stats?.typeTrend?.cheque, trendLabels.length),
  };

  const fileIn = normalizeSeries(stats?.fileIn, trendLabels.length);
  const fileOut = normalizeSeries(stats?.fileOut, trendLabels.length);

  const totalUsers = userStats.admin + userStats.fonctionnel + userStats.technique;
  const totalSnd = senderStats.mft + senderStats.mq + senderStats.pasap;
  const totalRec = receiverStats.recA + receiverStats.recB + receiverStats.recC;
  const totalTf = typeStats.virement + typeStats.prelevement + typeStats.cheque;

  return (
    <>
      <style>{`
        .acd-section-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #64748b;
          margin-bottom: 16px;
        }
        .acd-row4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        .acd-row2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        .acd-card {
          background: #101f38;
          border: 1px solid rgba(99, 90, 240, 0.18);
          border-radius: 16px;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .acd-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #7c6ff7, #06b6d4);
          border-radius: 2px 2px 0 0;
        }
        .acd-card-title {
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          margin-bottom: 3px;
        }
        .acd-card-sub {
          font-size: 11px;
          color: #475569;
          margin-bottom: 14px;
        }
        .acd-donut-wrap {
          position: relative;
          width: 130px;
          height: 130px;
          margin: 0 auto 14px;
        }
        .acd-donut-wrap canvas {
          width: 100% !important;
          height: 100% !important;
        }
        .acd-donut-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .acd-donut-num {
          font-family: 'Orbitron', monospace;
          font-size: 18px;
          font-weight: 600;
          color: #f8fafc;
        }
        .acd-donut-lbl {
          font-size: 10px;
          color: #64748b;
          margin-top: 2px;
        }
        .acd-legend-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .acd-legend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }
        .acd-legend-left {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
        }
        .acd-legend-sq {
          width: 9px;
          height: 9px;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .acd-legend-pct {
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          font-weight: 600;
        }
        .acd-line-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
          gap: 10px;
        }
        .acd-inline-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .acd-il-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #64748b;
        }
        .acd-il-sq {
          width: 9px;
          height: 9px;
        }
        .acd-chart-h {
          position: relative;
          width: 100%;
          height: 220px;
        }
        .acd-chart-h canvas {
          position: absolute;
          inset: 0;
          width: 100% !important;
          height: 100% !important;
        }
        @media (max-width: 1100px) {
          .acd-row4 { grid-template-columns: repeat(2, 1fr); }
          .acd-row2 { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .acd-row4 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="acd-section-title">Overview · distributions</div>

      <div className="acd-row4">
        <DonutCard
          id="acd-c1"
          title="Users by role"
          sub={`Total: ${totalUsers} users`}
          total={totalUsers}
          totalLabel="users"
          data={[userStats.admin, userStats.fonctionnel, userStats.technique]}
          colors={["#7c6ff7", "#06b6d4", "#10b981"]}
          legend={[
            { label: "Admin", color: "#7c6ff7", value: userStats.admin },
            { label: "Fonctionnel", color: "#06b6d4", value: userStats.fonctionnel },
            { label: "Technique", color: "#10b981", value: userStats.technique },
          ]}
        />

        <DonutCard
          id="acd-c2"
          title="Flux by sender"
          sub={`Total: ${totalSnd} flows`}
          total={totalSnd}
          totalLabel="flows"
          data={[senderStats.mft, senderStats.mq, senderStats.pasap]}
          colors={["#7c6ff7", "#06b6d4", "#10b981"]}
          legend={[
            { label: senderLabels.mft, color: "#7c6ff7", value: senderStats.mft },
            { label: senderLabels.mq, color: "#06b6d4", value: senderStats.mq },
            { label: senderLabels.pasap, color: "#10b981", value: senderStats.pasap },
          ]}
        />

        <DonutCard
          id="acd-c3"
          title="Flux by receiver"
          sub={`Total: ${totalRec} flows`}
          total={totalRec}
          totalLabel="flows"
          data={[receiverStats.recA, receiverStats.recB, receiverStats.recC]}
          colors={["#f59e0b", "#ec4899", "#8b5cf6"]}
          legend={[
            { label: receiverLabels.recA, color: "#f59e0b", value: receiverStats.recA },
            { label: receiverLabels.recB, color: "#ec4899", value: receiverStats.recB },
            { label: receiverLabels.recC, color: "#8b5cf6", value: receiverStats.recC },
          ]}
        />

        <DonutCard
          id="acd-c4"
          title="Flux by type"
          sub={`Total: ${totalTf} flows`}
          total={totalTf}
          totalLabel="flows"
          data={[typeStats.virement, typeStats.prelevement, typeStats.cheque]}
          colors={["#10b981", "#f43f5e", "#f59e0b"]}
          legend={[
            { label: typeLabels.virement, color: "#10b981", value: typeStats.virement },
            { label: typeLabels.prelevement, color: "#f43f5e", value: typeStats.prelevement },
            { label: typeLabels.cheque, color: "#f59e0b", value: typeStats.cheque },
          ]}
        />
      </div>

      <div className="acd-row2">
        <LineCard
          id="acd-c5"
          title="Sender trend"
          sub="Flows per sender"
          xLabels={trendLabels}
          legend={[
            { label: senderLabels.mft, color: "#7c6ff7" },
            { label: senderLabels.mq, color: "#06b6d4", circle: true },
            { label: senderLabels.pasap, color: "#10b981" },
          ]}
          datasets={[
            { label: senderLabels.mft, color: "#7c6ff7", data: senderTrend.mft },
            { label: senderLabels.mq, color: "#06b6d4", data: senderTrend.mq, dash: [5, 3] },
            { label: senderLabels.pasap, color: "#10b981", data: senderTrend.pasap },
          ]}
        />

        <LineCard
          id="acd-c6"
          title="Receiver trend"
          sub="Flows per receiver"
          xLabels={trendLabels}
          legend={[
            { label: receiverLabels.recA, color: "#f59e0b" },
            { label: receiverLabels.recB, color: "#ec4899", circle: true },
            { label: receiverLabels.recC, color: "#8b5cf6" },
          ]}
          datasets={[
            { label: receiverLabels.recA, color: "#f59e0b", data: receiverTrend.recA },
            { label: receiverLabels.recB, color: "#ec4899", data: receiverTrend.recB, dash: [5, 3] },
            { label: receiverLabels.recC, color: "#8b5cf6", data: receiverTrend.recC },
          ]}
        />

        <LineCard
          id="acd-c7"
          title="Type flux trend"
          sub="Flows by type per day"
          xLabels={trendLabels}
          legend={[
            { label: typeLabels.virement, color: "#10b981" },
            { label: typeLabels.prelevement, color: "#f43f5e", circle: true },
            { label: typeLabels.cheque, color: "#f59e0b" },
          ]}
          datasets={[
            { label: typeLabels.virement, color: "#10b981", data: typeTrend.virement },
            { label: typeLabels.prelevement, color: "#f43f5e", data: typeTrend.prelevement, dash: [5, 3] },
            { label: typeLabels.cheque, color: "#f59e0b", data: typeTrend.cheque },
          ]}
        />

        <LineCard
          id="acd-c8"
          title="File IN vs File OUT"
          sub="Volume comparison per day"
          xLabels={trendLabels}
          legend={[
            { label: "File IN", color: "#06b6d4" },
            { label: "File OUT", color: "#10b981", circle: true },
          ]}
          datasets={[
            { label: "File IN", color: "#06b6d4", data: fileIn },
            { label: "File OUT", color: "#10b981", data: fileOut, dash: [5, 3] },
          ]}
        />
      </div>
    </>
  );
}