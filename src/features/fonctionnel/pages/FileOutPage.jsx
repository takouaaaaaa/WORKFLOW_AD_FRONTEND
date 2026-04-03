import { useEffect, useMemo, useState } from "react";
import { getFileOuts } from "../services/fileOutService";
import "./FileInPage.css"; // on réutilise le même CSS

const ITEMS_PER_PAGE = 10;

export default function FileOutPage() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    appReference: "",
    sender: "",
    receiver: "",
    flowType: "",
    status: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getFileOuts();
    const data = Array.isArray(res.data) ? res.data : res.data.content || [];
    setRows(data);
    setFilteredRows(data);
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSearch = () => {
    let result = [...rows];

    result = result.filter((row) => {
      const appReference = row.flux?.appReference || "";
      const sender = row.flux?.sender?.sender || "";
      const receiver = row.flux?.receiver?.receiver || "";
      const flowType = row.flux?.typeFlux?.flowType || "";
      const status = row.statutFluxOUT || "";

      return (
        appReference.toLowerCase().includes(filters.appReference.toLowerCase()) &&
        sender.toLowerCase().includes(filters.sender.toLowerCase()) &&
        receiver.toLowerCase().includes(filters.receiver.toLowerCase()) &&
        flowType.toLowerCase().includes(filters.flowType.toLowerCase()) &&
        (!filters.status || status === filters.status)
      );
    });

    setFilteredRows(result);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({
      appReference: "",
      sender: "",
      receiver: "",
      flowType: "",
      status: "",
    });
    setFilteredRows(rows);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE) || 1;

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRows, currentPage]);

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const statusClass = (s) => {
    if (!s) return "";
    if (["SENT", "ACKED"].includes(s)) return "processed";
    if (["WAITTOBESENT"].includes(s)) return "wait";
    if (["INERROR", "BLOCKED"].includes(s)) return "error";
    return "inprocess";
  };

  return (
    <div className="filein-page">

      {/* SEARCH */}
      <div className="filein-search-card">
        <div className="filein-card-title">Detailed Search : File OUT</div>

        <div className="filein-search-grid">

          <div className="field">
            <label>App Reference</label>
            <input name="appReference" value={filters.appReference} onChange={handleFilterChange}/>
          </div>

          <div className="field">
            <label>Sender</label>
            <input name="sender" value={filters.sender} onChange={handleFilterChange}/>
          </div>

          <div className="field">
            <label>Receiver</label>
            <input name="receiver" value={filters.receiver} onChange={handleFilterChange}/>
          </div>

          <div className="field">
            <label>Flow Type</label>
            <input name="flowType" value={filters.flowType} onChange={handleFilterChange}/>
          </div>

          <div className="field">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="SENT">SENT</option>
              <option value="ACKED">ACKED</option>
              <option value="INERROR">INERROR</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>

        </div>

        <div className="filein-search-actions">
          <button className="btn reset" onClick={handleReset}>Reinitialize</button>
          <button className="btn search" onClick={handleSearch}>Search</button>
        </div>
      </div>

      {/* TABLE */}
      <div className="filein-result-card">
        <div className="filein-card-title">Search Result : File OUT</div>

        <div className="filein-table-wrapper">
          <table className="filein-table">
            <thead>
              <tr>
                <th>App Ref</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Flow Type</th>
                <th>Status</th>
                <th>Creation Date</th>
                <th>Update Date</th>
                <th>Address</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRows.map((row) => (
                <tr key={row.idFluxOut}>
                  <td className="mono">{row.flux?.appReference || "—"}</td>
                  <td>{row.flux?.sender?.sender || "—"}</td>
                  <td>{row.flux?.receiver?.receiver || "—"}</td>
                  <td>{row.flux?.typeFlux?.flowType || "—"}</td>

                  <td>
                    <span className={`status-badge ${statusClass(row.statutFluxOUT)}`}>
                      {row.statutFluxOUT}
                    </span>
                  </td>

                  <td>{formatDate(row.creationDate)}</td>
                  <td>{formatDate(row.updateDate)}</td>
                  <td>{row.usedAddress || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="filein-footer">
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              Prev
            </button>
            <span>Page {currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}