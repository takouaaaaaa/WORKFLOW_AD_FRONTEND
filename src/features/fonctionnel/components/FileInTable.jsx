export default function FileInTable({
  rows,
  selectedRow,
  setSelectedRow,
  formatDate,
  truncate,
  statusClass,
}) {
  const statusLabel = {
  INITIATED: "Initiated",
  BLOCKED: "Blocked",
  WAITACTION: "Wait Action",
  CANCELED: "Canceled",
  SUSPENDED: "Suspended",
  PUTINQUEUEFAILED: "Queue Failed",
  INIT: "Init",
  PROCESSED: "Processed",
  INTECHNICALERROR: "Technical Error",
  NOCONTRACTFOUND: "No Contract",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
  INPROCESS: "In Process",
  INBUSINESSERROR: "Business Error",
};

  return (
    <div className="filein-card">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="filein-card-title">
        <span>
          Search Result :{" "}
          <span style={{ color: "#a371f7" }}>File IN</span>
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "11px",
            color: "#8b949e",
            background: "#21262d",
            padding: "3px 10px",
            borderRadius: "20px",
            border: "1px solid #30363d",
            fontWeight: 400,
            letterSpacing: "0.04em",
            textTransform: "none",
          }}
        >
          {rows.length.toLocaleString()} results
        </span>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="filein-table-wrap">
        <table className="table filein-table align-middle mb-0">
          <thead>
            <tr>
             
              <th className="col-app">App Ref</th>
              <th className="col-sender-ref">Sender Ref</th>
              <th className="col-sender">Sender</th>
              <th className="col-date">Sending Date</th>
              <th className="col-status">Status</th>
              <th className="col-flow">Flow Type</th>
              <th className="col-amount" style={{ textAlign: "right" }}>Amount</th>
              <th className="col-date">Settlement</th>
              <th className="col-category">Category</th>
              <th className="col-message">Message</th>
              <th className="col-receiver">Receiver</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const isSelected = selectedRow?.idFluxIn === row.idFluxIn;
              const status     = statusClass(row.statutFluxIn);

              return (
                <tr
                  key={row.idFluxIn}
                  className={isSelected ? "selected-row" : ""}
                  onClick={() => setSelectedRow(row)}
                  style={{ cursor: "pointer" }}
                >
                 
                  {/* App Ref */}
                  <td
                    className="mono col-app"
                    title={row.flux?.appReference || "—"}
                  >
                    {truncate(row.flux?.appReference || "—", 14)}
                  </td>

                  {/* Sender Ref */}
                  <td
                    className="mono col-sender-ref"
                    title={row.senderReference || "—"}
                  >
                    {truncate(row.senderReference || "—", 16)}
                  </td>

                  {/* Sender */}
                  <td
                    className="col-sender"
                    title={row.flux?.sender?.sender || "—"}
                  >
                    {truncate(row.flux?.sender?.sender || "—", 14)}
                  </td>

                  {/* Sending Date */}
                  <td className="col-date">
                    {truncate(formatDate(row.sendingDate), 16)}
                  </td>

                  {/* Status */}
                  <td className="col-status">
                    <span className={`status-badge ${status}`}>
                      {statusLabel[status] || row.statutFluxIn || "—"}
                    </span>
                  </td>

                  {/* Flow Type */}
                  <td
                    className="col-flow"
                    title={
                      row.flux?.typeFlux?.flowType ||
                      row.flux?.typeFlux?.FlowType ||
                      "—"
                    }
                  >
                    <span className="flow-chip">
                      {truncate(
                        row.flux?.typeFlux?.flowType ||
                          row.flux?.typeFlux?.FlowType ||
                          "—",
                        18
                      )}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="col-amount" style={{ textAlign: "right" }}>
                    {row.flux?.totalAmount != null ? (
                      <span className="amount-val">
                        {Number(row.flux.totalAmount).toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    ) : (
                      <span className="amount-empty">—</span>
                    )}
                  </td>

                  {/* Settlement Date */}
                  <td className="col-date">
                    {truncate(formatDate(row.settlementDate), 16)}
                  </td>

                  {/* Category */}
                  <td className="col-category" title={row.category || "—"}>
                    <span className="category-tag">
                      {truncate(row.category || "—", 12)}
                    </span>
                  </td>

                  {/* Message */}
                  <td className="col-message" title={row.message || "—"}>
                    {truncate(row.message || "—", 18)}
                  </td>

                  {/* Receiver */}
                  <td
                    className="col-receiver"
                    title={row.flux?.receiver?.receiver || "—"}
                  >
                    {truncate(row.flux?.receiver?.receiver || "—", 14)}
                  </td>
                </tr>
              );
            })}

            {/* Empty state */}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: "#6e7681",
                    fontFamily: "'Sora', sans-serif",
                    fontSize: "13px",
                  }}
                >
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}