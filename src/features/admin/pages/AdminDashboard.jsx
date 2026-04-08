import { useEffect, useRef } from "react";
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

/* ─── helpers ─── */
function DonutCard({ id, title, sub, total, totalLabel, data, colors, legend }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (chartRef.current) chartRef.current.destroy();
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
            callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` },
          },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [data, colors]);

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
              {item.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineCard({ id, title, sub, legend, datasets }) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    if (!ref.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels: days,
        datasets: datasets.map((ds) => ({
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
            ticks: { font: { size: 10 }, color: "#475569" },
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
    return () => chartRef.current?.destroy();
  }, [datasets]);

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

/* ─── main component ─── */
export default function AdminChartsSection({ stats }) {
  /*
   * stats prop shape (feed from your real API calls):
   * {
   *   users:     { admin: number, fonctionnel: number, technique: number },
   *   senders:   { mft: number, mq: number, pasap: number },
   *   receivers: { recA: number, recB: number, recC: number },
   *   typeFlux:  { virement: number, prelevement: number, cheque: number },
   *   fileIn:    number[],   // array of 7 daily counts
   *   fileOut:   number[],   // array of 7 daily counts
   *   senderTrend:   { mft: number[], mq: number[], pasap: number[] },
   *   receiverTrend: { recA: number[], recB: number[], recC: number[] },
   *   typeTrend:     { virement: number[], prelevement: number[], cheque: number[] },
   * }
   *
   * Fallback to demo data if stats is not provided.
   */

  const s = stats || {};

  /* --- donut data --- */
  const users = s.users || { admin: 10, fonctionnel: 15, technique: 11 };
  const totalUsers = users.admin + users.fonctionnel + users.technique;
  const upAdmin = Math.round((users.admin / totalUsers) * 100);
  const upFonc  = Math.round((users.fonctionnel / totalUsers) * 100);
  const upTech  = 100 - upAdmin - upFonc;

  const snd = s.senders || { mft: 122, mq: 81, pasap: 67 };
  const totalSnd = snd.mft + snd.mq + snd.pasap;
  const spMft   = Math.round((snd.mft / totalSnd) * 100);
  const spMq    = Math.round((snd.mq  / totalSnd) * 100);
  const spPasap = 100 - spMft - spMq;

  const rec = s.receivers || { recA: 103, recB: 95, recC: 72 };
  const totalRec = rec.recA + rec.recB + rec.recC;
  const rpA = Math.round((rec.recA / totalRec) * 100);
  const rpB = Math.round((rec.recB / totalRec) * 100);
  const rpC = 100 - rpA - rpB;

  const tf = s.typeFlux || { virement: 108, prelevement: 95, cheque: 67 };
  const totalTf = tf.virement + tf.prelevement + tf.cheque;
  const tpV = Math.round((tf.virement    / totalTf) * 100);
  const tpP = Math.round((tf.prelevement / totalTf) * 100);
  const tpC = 100 - tpV - tpP;

  /* --- line trend data --- */
  const senderTrend   = s.senderTrend   || { mft: [120,145,108,160,122,90,135], mq: [80,95,72,100,95,65,88], pasap: [60,72,58,78,67,50,62] };
  const receiverTrend = s.receiverTrend || { recA: [102,118,95,130,108,82,115], recB: [94,105,88,118,95,75,104], recC: [74,85,68,92,75,58,78] };
  const typeTrend     = s.typeTrend     || { virement: [108,130,100,140,118,88,120], prelevement: [95,112,85,122,102,76,105], cheque: [67,82,60,88,72,52,70] };
  const fileIn        = s.fileIn        || [110,130,98,145,142,90,118];
  const fileOut       = s.fileOut       || [95,118,88,132,128,80,108];

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
          height: 170px;
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

      {/* ── 4 donuts ── */}
      <div className="acd-row4">
        <DonutCard
          id="acd-c1"
          title="Users by role"
          sub={`Total: ${totalUsers} users`}
          total={totalUsers}
          totalLabel="users"
          data={[upAdmin, upFonc, upTech]}
          colors={["#7c6ff7", "#06b6d4", "#10b981"]}
          legend={[
            { label: "Admin",       color: "#7c6ff7", pct: upAdmin },
            { label: "Fonctionnel", color: "#06b6d4", pct: upFonc  },
            { label: "Technique",   color: "#10b981", pct: upTech  },
          ]}
        />
        <DonutCard
          id="acd-c2"
          title="Flux by sender type"
          sub={`Total: ${totalSnd} flows`}
          total={totalSnd}
          totalLabel="flows"
          data={[spMft, spMq, spPasap]}
          colors={["#7c6ff7", "#06b6d4", "#10b981"]}
          legend={[
            { label: "MFT",   color: "#7c6ff7", pct: spMft   },
            { label: "MQ",    color: "#06b6d4", pct: spMq    },
            { label: "PASAP", color: "#10b981", pct: spPasap },
          ]}
        />
        <DonutCard
          id="acd-c3"
          title="Flux by receiver"
          sub={`Total: ${totalRec} flows`}
          total={totalRec}
          totalLabel="flows"
          data={[rpA, rpB, rpC]}
          colors={["#f59e0b", "#ec4899", "#8b5cf6"]}
          legend={[
            { label: "REC-A", color: "#f59e0b", pct: rpA },
            { label: "REC-B", color: "#ec4899", pct: rpB },
            { label: "REC-C", color: "#8b5cf6", pct: rpC },
          ]}
        />
        <DonutCard
          id="acd-c4"
          title="Flux by type"
          sub={`Total: ${totalTf} flows`}
          total={totalTf}
          totalLabel="flows"
          data={[tpV, tpP, tpC]}
          colors={["#10b981", "#f43f5e", "#f59e0b"]}
          legend={[
            { label: "Virement",    color: "#10b981", pct: tpV },
            { label: "Prélèvement", color: "#f43f5e", pct: tpP },
            { label: "Chèque",      color: "#f59e0b", pct: tpC },
          ]}
        />
      </div>

      {/* ── 4 line charts ── */}
      <div className="acd-row2">
        <LineCard
          id="acd-c5"
          title="Sender trend · 7 days"
          sub="Flows per sender type"
          legend={[
            { label: "MFT",   color: "#7c6ff7" },
            { label: "MQ",    color: "#06b6d4", circle: true },
            { label: "PASAP", color: "#10b981" },
          ]}
          datasets={[
            { color: "#7c6ff7", data: senderTrend.mft   },
            { color: "#06b6d4", data: senderTrend.mq,    dash: [5, 3] },
            { color: "#10b981", data: senderTrend.pasap  },
          ]}
        />
        <LineCard
          id="acd-c6"
          title="Receiver trend · 7 days"
          sub="Flows per receiver"
          legend={[
            { label: "REC-A", color: "#f59e0b" },
            { label: "REC-B", color: "#ec4899", circle: true },
            { label: "REC-C", color: "#8b5cf6" },
          ]}
          datasets={[
            { color: "#f59e0b", data: receiverTrend.recA },
            { color: "#ec4899", data: receiverTrend.recB, dash: [5, 3] },
            { color: "#8b5cf6", data: receiverTrend.recC },
          ]}
        />
        <LineCard
          id="acd-c7"
          title="Type flux trend · 7 days"
          sub="Flows by type per day"
          legend={[
            { label: "Virement",    color: "#10b981" },
            { label: "Prélèvement", color: "#f43f5e", circle: true },
            { label: "Chèque",      color: "#f59e0b" },
          ]}
          datasets={[
            { color: "#10b981", data: typeTrend.virement    },
            { color: "#f43f5e", data: typeTrend.prelevement, dash: [5, 3] },
            { color: "#f59e0b", data: typeTrend.cheque       },
          ]}
        />
        <LineCard
          id="acd-c8"
          title="File IN vs File OUT · 7 days"
          sub="Volume comparison per day"
          legend={[
            { label: "File IN",  color: "#06b6d4" },
            { label: "File OUT", color: "#10b981", circle: true },
          ]}
          datasets={[
            { color: "#06b6d4", data: fileIn  },
            { color: "#10b981", data: fileOut, dash: [5, 3] },
          ]}
        />
      </div>
    </>
  );
}