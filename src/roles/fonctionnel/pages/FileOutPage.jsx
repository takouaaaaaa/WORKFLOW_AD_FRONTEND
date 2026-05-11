import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getFileOuts } from "../services/fileOutService";
import FileOutSearchCard from "../components/FileOutSearchCard";
import FileOutTable from "../components/FileOutTable";
import FileOutPagination from "../components/FileOutPagination";
import "../styles/FileOutPage.css";

const ITEMS_PER_PAGE = 10;

// StatutFileOut enum values only
const STATUS_LABEL = {
  INITIAL:             "Initial",
  REJECTED:            "Rejected",
  ERRORREPORTEDTOSENDER: "Error To Sender",
  SENT:                "Sent",
  SENTANDWAITINGACK:   "Sent Waiting Ack",
  ACKED:               "Acked",
};

const STATUS_OPTIONS = Object.keys(STATUS_LABEL);

export default function FileOutPage() {
  const location = useLocation();
  const urlStatus = location.state?.status || "";

  const [rows, setRows]               = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    appReference:      "",
    senderReference:   "",
    sender:            "",
    receiver:          "",
    flowType:          "",
    status:            urlStatus,
    creationDateFrom:  "",
    creationDateTo:    "",
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res  = await getFileOuts();
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setRows(data);

      if (urlStatus) {
        // status lives on FileOut directly, not on flux
        const filtered = data.filter((row) =>
          (row?.status || "").toUpperCase() === urlStatus.toUpperCase()
        );
        setFilteredRows(filtered);
      } else {
        setFilteredRows(data);
      }
    } catch (err) {
      console.error("Error loading File OUT:", err);
      setRows([]);
      setFilteredRows([]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const normalizeDate = (dateValue) => {
    if (!dateValue) return null;
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? null : d;
  };

  const handleSearch = () => {
    const result = rows.filter((row) => {
      const appReference    = row.appReferenceOut || "";
      const senderReference = row.flux?.senderReference || "";
      const sender          = row.flux?.sender?.sender || "";
      const receiver        = row.receiver?.receiver || "";
      const flowType        = row.flux?.typeFlux?.flowType || row.flux?.typeFlux?.FlowType || "";
      const status          = row.status || "";   // on FileOut directly
      const creationDate    = normalizeDate(row.creationDate);

      const filterCreationDateFrom = filters.creationDateFrom
        ? new Date(`${filters.creationDateFrom}T00:00:00`) : null;
      const filterCreationDateTo = filters.creationDateTo
        ? new Date(`${filters.creationDateTo}T23:59:59`) : null;

      return (
        appReference.toLowerCase().includes(filters.appReference.toLowerCase()) &&
        senderReference.toLowerCase().includes(filters.senderReference.toLowerCase()) &&
        (!filters.sender   || sender   === filters.sender) &&
        (!filters.receiver || receiver === filters.receiver) &&
        (!filters.flowType || flowType === filters.flowType) &&
        (!filters.status   || status   === filters.status) &&
        (!filterCreationDateFrom || (creationDate && creationDate >= filterCreationDateFrom)) &&
        (!filterCreationDateTo   || (creationDate && creationDate <= filterCreationDateTo))
      );
    });
    setFilteredRows(result);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({
      appReference: "", senderReference: "", sender: "", receiver: "",
      flowType: "", status: "", creationDateFrom: "", creationDateTo: "",
    });
    setFilteredRows(rows);
    setCurrentPage(1);
  };

  const senderOptions   = useMemo(() => [...new Set(rows.map((r) => r.flux?.sender?.sender).filter(Boolean))].sort(), [rows]);
  const receiverOptions = useMemo(() => [...new Set(rows.map((r) => r.receiver?.receiver).filter(Boolean))].sort(), [rows]);
  const flowTypeOptions = useMemo(() => [...new Set(rows.map((r) => r.flux?.typeFlux?.flowType || r.flux?.typeFlux?.FlowType).filter(Boolean))].sort(), [rows]);

  const totalPages    = Math.ceil(filteredRows.length / ITEMS_PER_PAGE) || 1;
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
    if (["ACKED"].includes(status)) return "processed";
    if (["INITIAL", "SENT", "SENTANDWAITINGACK"].includes(status)) return "inprocess";
    if (["REJECTED", "ERRORREPORTEDTOSENDER"].includes(status)) return "error";
    return "wait";
  };

  return (
    <div className="filein-page-bootstrap">
      {urlStatus && (
        <div className="filein-status-banner">
          Filtré par statut : <strong>{urlStatus}</strong>
          <span className="filein-status-count">{filteredRows.length} résultat(s)</span>
        </div>
      )}

      <FileOutSearchCard
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
        statusOptions={STATUS_OPTIONS}
        senderOptions={senderOptions}
        receiverOptions={receiverOptions}
        flowTypeOptions={flowTypeOptions}
      />

      <div className="filein-card">
        <div className="filein-card-title">
          <span>Search Result : <span className="accent">File OUT</span></span>
          <span className="filein-results-badge">
            {filteredRows.length === rows.length
              ? `${rows.length.toLocaleString()} total`
              : `${filteredRows.length.toLocaleString()} results`}
          </span>
        </div>

        <FileOutTable
          rows={paginatedRows}
          truncate={truncate}
          formatDate={formatDate}
          statusClass={statusClass}
          statusLabel={STATUS_LABEL}
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