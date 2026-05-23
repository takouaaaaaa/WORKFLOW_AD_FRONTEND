export default function FileOutTable({
  rows,
  truncate,
  formatDate,
  statusClass,
  statusLabel,
  loading = false,
}) {
  return (
    <div className="filein-table-wrap">
      <table className="filein-table">
        <thead>
          <tr>
            <th className="col-app">App Ref Out</th>
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
          {loading ? (
            <tr>
              <td colSpan={8} className="filein-table-empty">
                <span className="filein-loading">
                  <span className="filein-spinner" />
                  Loading data...
                </span>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="filein-table-empty">
                No results found.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.idFluxOut}>
                <td className="mono col-app" title={row.appReferenceOut || "—"}>
                  {truncate(row.appReferenceOut || "—", 16)}
                </td>

                <td className="col-sender" title={row.senderName || "—"}>
                  {truncate(row.senderName || "—", 14)}
                </td>

                <td className="col-receiver" title={row.receiverName || "—"}>
                  {truncate(row.receiverName || "—", 14)}
                </td>

                <td className="col-flow" title={row.flowType || "—"}>
                  <span className="flow-chip">
                    {truncate(row.flowType || "—", 18)}
                  </span>
                </td>

                <td className="col-status">
                  <span className={`status-badge ${statusClass(row.status || "")}`}>
                    {statusLabel[row.status] || row.status || "—"}
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}