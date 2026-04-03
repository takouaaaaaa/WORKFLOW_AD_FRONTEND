import { useEffect, useMemo, useState } from "react";
import { getFileOuts } from "../services/fileOutService";
import FileOutSearchCard from "../components/FileOutSearchCard";
import FileOutTable from "../components/FileOutTable";
import FileOutPagination from "../components/FileOutPagination";
import "../styles/FileInPage.css";

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

  const statusLabel = {
    NACKED: "Nacked",
    BLOCKED: "Blocked",
    ARCHIVED: "Archived",
    INERROR: "Error",
    INITIAL: "Initial",
    WAITTOBESENT: "Waiting",
    ERRORREPORTEDTOSENDER: "Error Reported",
    ACKED: "Acknowledged",
    SENTANDWAITINGACK: "Waiting Ack",
    SENT: "Sent",
    INITIATED: "Initiated",
    CANCELLED: "Cancelled",
    PUTINQUEUEOUTFAILED: "Queue Failed",
  };

  const statusOptions = Object.keys(statusLabel);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getFileOuts();
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setRows(data);
      setFilteredRows(data);
    } catch (err) {
      console.error("Error loading File OUT:", err);
      setRows([]);
      setFilteredRows([]);
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSearch = () => {
    const result = rows.filter((row) => {
      const appReference = row.flux?.appReference || "";
      const sender = row.flux?.sender?.sender || "";
      const receiver = row.flux?.receiver?.receiver || "";
      const flowType =
        row.flux?.typeFlux?.flowType || row.flux?.typeFlux?.FlowType || "";
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

  const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("fr-FR");
  };

  const truncate = (value, max = 18) => {
    if (!value) return "—";
    return value.length > max ? `${value.slice(0, max)}...` : value;
  };

  const statusClass = (status) => {
    if (!status) return "";

    switch (status) {
      case "SENT":
      case "ACKED":
      case "ARCHIVED":
        return "processed";

      case "WAITTOBESENT":
      case "SENTANDWAITINGACK":
      case "INITIAL":
      case "INITIATED":
        return "wait";

      case "INERROR":
      case "ERRORREPORTEDTOSENDER":
      case "PUTINQUEUEOUTFAILED":
      case "BLOCKED":
      case "NACKED":
      case "CANCELLED":
        return "error";

      default:
        return "inprocess";
    }
  };

  return (
    <div className="filein-page-bootstrap">
      <FileOutSearchCard
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
        statusOptions={statusOptions}
      />

      <div className="filein-card">
        <div className="filein-card-title">
          <span>
            Search Result : <span style={{ color: "#a371f7" }}>File OUT</span>
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
            }}
          >
            {filteredRows.length.toLocaleString()} results
          </span>
        </div>

        <FileOutTable
          rows={paginatedRows}
          truncate={truncate}
          formatDate={formatDate}
          statusClass={statusClass}
          statusLabel={statusLabel}
        />

        <FileOutPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={() => setCurrentPage((p) => p - 1)}
          onNext={() => setCurrentPage((p) => p + 1)}
        />
      </div>
    </div>
  );
}