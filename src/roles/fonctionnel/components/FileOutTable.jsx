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
          ) : (
            rows.map((row) => {
              // status lives on FileOut directly
              const fileOutStatus = row.status || "";

              return (
                <tr key={row.idFluxOut}>
                  <td className="mono col-app" title={row.appReferenceOut || "—"}>
                    {truncate(row.appReferenceOut || "—", 16)}
                  </td>

                  <td className="col-sender" title={row.flux?.sender?.sender || "—"}>
                    {truncate(row.flux?.sender?.sender || "—", 14)}
                  </td>

                  <td className="col-receiver" title={row.receiver?.receiver || "—"}>
                    {truncate(row.receiver?.receiver || "—", 14)}
                  </td>

                  <td className="col-flow" title={row.flux?.typeFlux?.flowType || row.flux?.typeFlux?.FlowType || "—"}>
                    <span className="flow-chip">
                      {truncate(row.flux?.typeFlux?.flowType || row.flux?.typeFlux?.FlowType || "—", 18)}
                    </span>
                  </td>

                  <td className="col-status">
                    <span className={`status-badge ${statusClass(fileOutStatus)}`}>
                      {statusLabel[fileOutStatus] || fileOutStatus || "—"}
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
            })
          )}
        </tbody>
      </table>
    </div>
  );
}