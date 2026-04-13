export default function FileOutTable({
  rows,
  truncate,
  formatDate,
  statusClass,
  statusLabel,
}) {
  return (
    <div className="filein-table-wrap">
      <table className="table filein-table align-middle mb-0">
        <thead>
          <tr>
            <th className="col-app">App Ref</th>
            <th className="col-sender">Sender</th>
            <th className="col-receiver">Receiver</th>
            <th className="col-flow">Flow Type</th>
            <th className="col-status">Status</th>
            <th className="col-date">Creation Date</th>
            <th className="col-date">Update Date</th>
            <th className="col-message">Address</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const fluxStatus = row.flux?.statut || "";
            const status = statusClass(fluxStatus);

            return (
              <tr key={row.idFluxOut}>
                <td className="mono col-app" title={row.appReference || row.flux?.appReference || "—"}>
                  {truncate(row.appReference || row.flux?.appReference || "—", 16)}
                </td>

                <td className="col-sender" title={row.flux?.sender?.sender || "—"}>
                  {truncate(row.flux?.sender?.sender || "—", 14)}
                </td>

                <td
                  className="col-receiver"
                  title={row.receiver?.receiver || "—"}
                >
                  {truncate(row.receiver?.receiver || "—", 14)}
                </td>

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

                <td className="col-status">
                  <span className={`status-badge ${status}`}>
                    {statusLabel[fluxStatus] || fluxStatus || "—"}
                  </span>
                </td>

                <td className="col-date" title={formatDate(row.creationDate)}>
                  {truncate(formatDate(row.creationDate), 16)}
                </td>

                <td className="col-date" title={formatDate(row.updateDate)}>
                  {truncate(formatDate(row.updateDate), 16)}
                </td>

                <td className="col-message" title={row.usedAddress || "—"}>
                  {truncate(row.usedAddress || "—", 18)}
                </td>
              </tr>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={8}
                style={{
                  textAlign: "center",
                  padding: "40px",
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
  );
}