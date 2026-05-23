const STATUS_LABEL = {
  INIT:             "Init",
  WAITPROCESS:      "Wait Process",
  INPROCESS:        "In Process",
  PROCESSED:        "Processed",
  PUTINQUEUEFAILED: "Queue Failed",
  INTECHNICALERROR: "Tech Error",
  INBUSINESSERROR:  "Biz Error",
  REJECTED:         "Rejected",
  BLOCKED:          "Blocked",
  ARCHIVED:         "Archived",
  WAITACTION:       "Wait Action",
  SUSPENDED:        "Suspended",
  CANCELED:         "Canceled",
};
const truncate = (value, max = 30) => {
  if (value === null || value === undefined) {
    return "—";
  }

  const text = String(value);

  return text.length > max
    ? text.slice(0, max) + "..."
    : text;
};
const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const statusClass = (status) => {
  switch (status) {
    case "PROCESSED":
      return "success";

    case "INPROCESS":
      return "processing";

    case "REJECTED":
    case "INTECHNICALERROR":
    case "INBUSINESSERROR":
      return "danger";

    case "WAITPROCESS":
      return "warning";

    default:
      return "default";
  }
};
export default function FileInTable({
  rows,
  totalCount = 0,
  selectedRow,
  setSelectedRow,
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
              <th className="col-message">Description</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={10} className="filein-table-empty">No results found.</td></tr>
            ) : rows.map((row) => {
              const isSelected = selectedRow?.idFluxIn === row.idFluxIn;
              return (
                <tr
                  key={row.idFluxIn}
                  onClick={() => setSelectedRow(row)}
                  className={isSelected ? "selected-row" : ""}
                >
                  {/* appReference — on FileInDTO directly */}
                  <td className="mono col-app" title={row.appReference || "—"}>
                    {truncate(row.appReference || "—", 16)}
                  </td>

                  {/* senderReference — flat on DTO */}
                  <td className="mono col-sender-ref" title={row.senderReference || "—"}>
                    {truncate(row.senderReference || "—", 20)}
                  </td>

                  {/* senderName — flat on DTO */}
                  <td className="col-sender" title={row.senderName || "—"}>
                    {truncate(row.senderName || "—", 14)}
                  </td>

                  <td className="col-date" title={formatDate(row.sendingDate)}>
                    {truncate(formatDate(row.sendingDate), 16)}
                  </td>

                  <td className="col-status">
                    <span className={`status-badge ${statusClass(row.status || "")}`}>
                      {STATUS_LABEL[row.status] || row.status || "—"}
                    </span>
                  </td>

                  {/* flowType — flat on DTO */}
                  <td className="col-flow" title={row.flowType || "—"}>
                    <span className="flow-chip">
                      {truncate(row.flowType || "—", 18)}
                    </span>
                  </td>

                  {/* totalAmount — flat on DTO */}
                  <td className="col-amount">
                    {row.totalAmount != null ? (
                      <span className="amount-val">
                        {Number(row.totalAmount).toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    ) : <span className="amount-empty">—</span>}
                  </td>

                  <td className="col-date" title={formatDate(row.settlementDate)}>
                    {truncate(formatDate(row.settlementDate), 16)}
                  </td>

                  <td className="col-category" title={row.category || "—"}>
                    <span className="category-tag">{truncate(row.category || "—", 12)}</span>
                  </td>

                  <td className="col-message" title={row.descriptionFileIn || "—"}>
                    {truncate(row.descriptionFileIn || "—", 24)}
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