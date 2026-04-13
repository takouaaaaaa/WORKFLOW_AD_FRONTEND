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

  const initialFilters = {
    appReference: "",
    senderReference: "",
    sender: "",
    receiver: "",
    flowType: "",
    status: "",
    creationDateFrom: "",
    creationDateTo: "",
  };

  const [filters, setFilters] = useState(initialFilters);

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
    PROCESSED: "Processed",
    INPROCESS: "In Process",
    REJECTED: "Rejected",
    INTECHNICALERROR: "Technical Error",
    INBUSINESSERROR: "Business Error",
    NOCONTRACTFOUND: "No Contract",
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
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const normalizeDate = (dateValue) => {
    if (!dateValue) return null;
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? null : d;
  };

  const handleSearch = () => {
    const result = rows.filter((row) => {
      const appReference = row.appReference || row.flux?.appReference || "";
      const senderReference = row.flux?.senderReference || "";
      const sender = row.flux?.sender?.sender || "";
      const receiver = row.receiver?.receiver || "";
      const flowType =
        row.flux?.typeFlux?.flowType || row.flux?.typeFlux?.FlowType || "";
      const status = row.flux?.statut || "";
      const creationDate = normalizeDate(row.creationDate);

      const filterCreationDateFrom = filters.creationDateFrom
        ? new Date(`${filters.creationDateFrom}T00:00:00`)
        : null;

      const filterCreationDateTo = filters.creationDateTo
        ? new Date(`${filters.creationDateTo}T23:59:59`)
        : null;

      const matchesAppReference = appReference
        .toLowerCase()
        .includes(filters.appReference.toLowerCase());

      const matchesSenderReference = senderReference
        .toLowerCase()
        .includes(filters.senderReference.toLowerCase());

      const matchesSender = !filters.sender || sender === filters.sender;
      const matchesReceiver = !filters.receiver || receiver === filters.receiver;
      const matchesFlowType = !filters.flowType || flowType === filters.flowType;
      const matchesStatus = !filters.status || status === filters.status;

      const matchesCreationDateFrom =
        !filterCreationDateFrom ||
        (creationDate && creationDate >= filterCreationDateFrom);

      const matchesCreationDateTo =
        !filterCreationDateTo ||
        (creationDate && creationDate <= filterCreationDateTo);

      return (
        matchesAppReference &&
        matchesSenderReference &&
        matchesSender &&
        matchesReceiver &&
        matchesFlowType &&
        matchesStatus &&
        matchesCreationDateFrom &&
        matchesCreationDateTo
      );
    });

    setFilteredRows(result);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setFilteredRows(rows);
    setCurrentPage(1);
  };

  const senderOptions = useMemo(() => {
    return [...new Set(rows.map((row) => row.flux?.sender?.sender).filter(Boolean))].sort();
  }, [rows]);

  const receiverOptions = useMemo(() => {
    return [...new Set(rows.map((row) => row.receiver?.receiver).filter(Boolean))].sort();
  }, [rows]);

  const flowTypeOptions = useMemo(() => {
    return [
      ...new Set(
        rows
          .map((row) => row.flux?.typeFlux?.flowType || row.flux?.typeFlux?.FlowType)
          .filter(Boolean)
      ),
    ].sort();
  }, [rows]);

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
      case "PROCESSED":
        return "processed";

      case "WAITTOBESENT":
      case "SENTANDWAITINGACK":
      case "INITIAL":
      case "INITIATED":
      case "INPROCESS":
        return "wait";

      case "INERROR":
      case "ERRORREPORTEDTOSENDER":
      case "PUTINQUEUEOUTFAILED":
      case "BLOCKED":
      case "NACKED":
      case "CANCELLED":
      case "REJECTED":
      case "INTECHNICALERROR":
      case "INBUSINESSERROR":
      case "NOCONTRACTFOUND":
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
        senderOptions={senderOptions}
        receiverOptions={receiverOptions}
        flowTypeOptions={flowTypeOptions}
      />

      <div className="filein-card">
        <div className="filein-card-title">
          <span>
            Search Result : <span className="accent">File OUT</span>
          </span>

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