const STATUS_LABEL = {
  INITIATED: "Initiated", BLOCKED: "Blocked", WAITACTION: "Wait Action",
  CANCELED: "Canceled", SUSPENDED: "Suspended", PUTINQUEUEFAILED: "Queue Failed",
  INIT: "Init", PROCESSED: "Processed", INTECHNICALERROR: "Tech Error",
  NOCONTRACTFOUND: "No Contract", REJECTED: "Rejected", ARCHIVED: "Archived",
  INPROCESS: "In Process", INBUSINESSERROR: "Biz Error",
};

export default function FileInTable({
  rows, totalCount = 0, selectedRow, setSelectedRow, truncate, formatDate, statusClass,
}) {
  const headerText = rows.length === totalCount
    ? `${totalCount.toLocaleString()} total`
    : `${rows.length.toLocaleString()} results`;

  return (
    <div className="filein-card">
      <div className="filein-card-title">
        <span>Search Result : <span className="accent">File IN</span></span>
        <span className="filein-results-badge">{headerText}</span>
      </div>

      <div className="filein-table-wrap">
        <table className="filein-table">
          <thead>
            <tr>
              <th className="col-app">App Ref</th>
              <th className="col-sender-ref">Sender Ref</th>
              <th className="col-sender">Sender</th>
              <th className="col-date">Sending Date</th>
              <th className="col-status">Status</th>
              <th className="col-flow">Flow Type</th>
              <th className="col-amount">Amount</th>
              <th className="col-date">Settlement</th>
              <th className="col-category">Category</th>
              <th className="col-message">Message</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={10} className="filein-table-empty">No results found.</td></tr>
            ) : rows.map((row) => {
              const fluxStatus = row.flux?.statut || "";
              const isSelected = selectedRow?.idFluxIn === row.idFluxIn;
              return (
                <tr
                  key={row.idFluxIn}
                  onClick={() => setSelectedRow(row)}
                  className={isSelected ? "selected-row" : ""}
                >
                  <td className="mono col-app" title={row.appReference || row.flux?.appReference || "—"}>
                    {truncate(row.appReference || row.flux?.appReference || "—", 16)}
                  </td>
                  <td className="mono col-sender-ref" title={row.flux?.senderReference || "—"}>
                    {truncate(row.flux?.senderReference || "—", 20)}
                  </td>
                  <td className="col-sender" title={row.flux?.sender?.sender || "—"}>
                    {truncate(row.flux?.sender?.sender || "—", 14)}
                  </td>
                  <td className="col-date" title={formatDate(row.sendingDate)}>
                    {truncate(formatDate(row.sendingDate), 16)}
                  </td>
                  <td className="col-status">
                    <span className={`status-badge ${statusClass(fluxStatus)}`}>
                      {STATUS_LABEL[fluxStatus] || fluxStatus || "—"}
                    </span>
                  </td>
                  <td className="col-flow" title={row.flux?.typeFlux?.flowType || row.flux?.typeFlux?.FlowType || "—"}>
                    <span className="flow-chip">
                      {truncate(row.flux?.typeFlux?.flowType || row.flux?.typeFlux?.FlowType || "—", 18)}
                    </span>
                  </td>
                  <td className="col-amount">
                    {row.flux?.totalAmount != null ? (
                      <span className="amount-val">
                        {Number(row.flux.totalAmount).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    ) : <span className="amount-empty">—</span>}
                  </td>
                  <td className="col-date" title={formatDate(row.settlementDate)}>
                    {truncate(formatDate(row.settlementDate), 16)}
                  </td>
                  <td className="col-category" title={row.category || "—"}>
                    <span className="category-tag">{truncate(row.category || "—", 12)}</span>
                  </td>
                  <td className="col-message" title={row.flux?.description || "—"}>
                    {truncate(row.flux?.description || "—", 24)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}