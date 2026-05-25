const STATUS_LABEL = {
  INIT: "Init",
  WAITPROCESS: "Wait Process",
  INPROCESS: "In Process",
  PROCESSED: "Processed",
  PUTINQUEUEFAILED: "Queue Failed",
  INTECHNICALERROR: "Tech Error",
  INBUSINESSERROR: "Biz Error",
  REJECTED: "Rejected",
  BLOCKED: "Blocked",
  ARCHIVED: "Archived",
  WAITACTION: "Wait Action",
  SUSPENDED: "Suspended",
  CANCELED: "Canceled",
};

const truncate = (value, max = 30) => {
  if (value === null || value === undefined || value === "") return "—";

  const text = String(value);

  return text.length > max ? `${text.slice(0, max)}...` : text;
};

const formatDate = (date) => {
  if (!date) return "—";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAmount = (value) => {
  if (value === null || value === undefined || value === "") return "—";

  const n = Number(value);

  if (!Number.isFinite(n)) return "—";

  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const statusClass = (status) => {
  const s = String(status || "").toUpperCase();

  switch (s) {
    case "PROCESSED":
      return "processed";

    case "INPROCESS":
      return "inprocess";

    case "WAITPROCESS":
    case "WAITACTION":
    case "SUSPENDED":
      return "wait";

    case "REJECTED":
    case "PUTINQUEUEFAILED":
    case "INTECHNICALERROR":
    case "INBUSINESSERROR":
    case "BLOCKED":
    case "CANCELED":
      return "error";

    default:
      return "";
  }
};

const getRowId = (row) =>
  row?.idFlux || row?.idFluxIn || row?.id || row?.appReference;

const getSenderDisplay = (row) =>
  row?.senderName ||
  row?.sender ||
  row?.sender?.sender ||
  row?.sender?.senderName ||
  row?.flux?.sender?.sender ||
  row?.flux?.sender?.senderName ||
  "—";

const getFlowTypeDisplay = (row) =>
  row?.flowType ||
  row?.typeFlux?.flowType ||
  row?.typeFlux?.FlowType ||
  row?.flux?.typeFlux?.flowType ||
  row?.flux?.typeFlux?.FlowType ||
  "—";

export default function FileInTable({
  rows = [],
  selectedRow,
  setSelectedRow,
  loading = false,
}) {
  const selectedId = getRowId(selectedRow);

  return (
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
          {loading ? (
            <tr>
              <td colSpan={10} className="filein-table-empty">
                <span className="filein-loading">
                  <span className="filein-spinner" />
                  Loading data...
                </span>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={10} className="filein-table-empty">
                No results found.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => {
              const rowId = getRowId(row);
              const isSelected = selectedId && selectedId === rowId;
              const status = String(row.status || "").toUpperCase();
              const senderDisplay = getSenderDisplay(row);
              const flowTypeDisplay = getFlowTypeDisplay(row);

              return (
                <tr
                  key={`${rowId || row.appReference || "filein"}-${index}`}
                  onClick={() => setSelectedRow(row)}
                  className={isSelected ? "selected-row" : ""}
                >
                  <td
                    className="mono col-app"
                    title={row.appReference || "—"}
                  >
                    {truncate(row.appReference, 16)}
                  </td>

                  <td
                    className="mono col-sender-ref"
                    title={row.senderReference || "—"}
                  >
                    {truncate(row.senderReference, 20)}
                  </td>

                  <td className="col-sender" title={senderDisplay}>
                    {truncate(senderDisplay, 18)}
                  </td>

                  <td className="col-date" title={formatDate(row.sendingDate)}>
                    {truncate(formatDate(row.sendingDate), 16)}
                  </td>

                  <td className="col-status">
                    <span className={`status-badge ${statusClass(status)}`}>
                      {STATUS_LABEL[status] || status || "—"}
                    </span>
                  </td>

                  <td className="col-flow" title={flowTypeDisplay}>
                    <span className="flow-chip">
                      {truncate(flowTypeDisplay, 18)}
                    </span>
                  </td>

                  <td className="col-amount">
                    {row.totalAmount != null ? (
                      <span className="amount-val">
                        {formatAmount(row.totalAmount)}
                      </span>
                    ) : (
                      <span className="amount-empty">—</span>
                    )}
                  </td>

                  <td
                    className="col-date"
                    title={formatDate(row.settlementDate)}
                  >
                    {truncate(formatDate(row.settlementDate), 16)}
                  </td>

                  <td className="col-category" title={row.category || "—"}>
                    <span className="category-tag">
                      {truncate(row.category, 12)}
                    </span>
                  </td>

                  <td
                    className="col-message"
                    title={row.descriptionFileIn || "—"}
                  >
                    {truncate(row.descriptionFileIn, 24)}
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