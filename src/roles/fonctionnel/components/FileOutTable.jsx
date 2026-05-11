export default function FileOutTable({ rows, truncate, formatDate, statusClass, statusLabel }) {
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
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="filein-table-empty">No results found.</td>
            </tr>
          ) : rows.map((row) => (
            <tr key={row.idFluxOut}>
              {/* appReferenceOut — on FileOutDTO directly */}
              <td className="mono col-app" title={row.appReferenceOut || "—"}>
                {truncate(row.appReferenceOut || "—", 16)}
              </td>

              {/* senderName — flat on DTO */}
              <td className="col-sender" title={row.senderName || "—"}>
                {truncate(row.senderName || "—", 14)}
              </td>

              {/* receiverName — flat on DTO */}
              <td className="col-receiver" title={row.receiverName || "—"}>
                {truncate(row.receiverName || "—", 14)}
              </td>

              {/* flowType — flat on DTO */}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}