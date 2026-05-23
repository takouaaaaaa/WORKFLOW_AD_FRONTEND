import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  getFileIns,
  downloadFileIn,
  updateFileIn,
  forceFileIn,
  rejectFileIn,
} from "../services/fileInService";

import http from "../../../services/http";

import FileInFilters from "../components/FileInFilters";
import FileInTable from "../components/FileInTable";
import FileInViewModal from "../components/FileInViewModal";
import FileInEditModal from "../components/FileInEditModal";

import "../styles/FileInpage.css";

const ITEMS_PER_PAGE = 10;

export default function FileInPage() {
  const location = useLocation();
  const urlStatus = location.state?.status || "";

  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);

  const [senders, setSenders] = useState([]);
  const [flowTypes, setFlowTypes] = useState([]);

  const [senderOptions, setSenderOptions] = useState([]);
  const [flowTypeOptions, setFlowTypeOptions] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);

  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    appReference: "",
    senderReference: "",
    status: urlStatus,
    category: "",
    sender: "",
    flowType: "",
    sendingDateFrom: "",
    sendingDateTo: "",
    totalAmountFrom: "",
    totalAmountTo: "",
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [fileInRes, senderRes, flowTypeRes] = await Promise.all([
        getFileIns(),
        http.get("/senders"),
        http.get("/typeflux"),
      ]);

      const fileIns = Array.isArray(fileInRes.data)
        ? fileInRes.data
        : fileInRes.data.content || [];

      const senderData = senderRes.data || [];
      const flowTypeData = flowTypeRes.data || [];

      setRows(fileIns);
      setSenders(senderData);
      setFlowTypes(flowTypeData);

      setSenderOptions(senderData.map((s) => s.sender).filter(Boolean).sort());
      setFlowTypeOptions(
        flowTypeData.map((f) => f.flowType).filter(Boolean).sort()
      );

      if (urlStatus) {
        setFilteredRows(
          fileIns.filter(
            (row) =>
              (row?.status || "").toUpperCase() === urlStatus.toUpperCase()
          )
        );
      } else {
        setFilteredRows(fileIns);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getSenderName = (senderId) =>
    senders.find((s) => s.idSender === senderId)?.sender || "";

  const getFlowTypeName = (flowTypeId) =>
    flowTypes.find((f) => f.idTypeFlux === flowTypeId)?.flowType || "";

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
const handleSearch = () => {
  
  const result = rows.filter((row) => {
    const appRef = (row?.appReference || "").toLowerCase();
    const senderRef = (row?.senderReference || "").toLowerCase();
    const status = (row?.status || "").toUpperCase();
    const category = (row?.category || "").toUpperCase();
    const senderName = row?.senderName || "";
    const flowTypeName = row?.flowType || "";
    const sendingDate = row?.sendingDate ? new Date(row.sendingDate) : null;
    const amount = row?.totalAmount != null ? Number(row.totalAmount) : null;

    if (filters.appReference && !appRef.includes(filters.appReference.toLowerCase())) return false;
    if (filters.senderReference && !senderRef.includes(filters.senderReference.toLowerCase())) return false;
    if (filters.status && status !== filters.status.toUpperCase()) return false;
    if (filters.category && category !== filters.category.toUpperCase()) return false;
    if (filters.sender && senderName !== filters.sender) return false;
    if (filters.flowType && flowTypeName !== filters.flowType) return false;

    if (filters.sendingDateFrom || filters.sendingDateTo) {
      if (!sendingDate) return false;
      if (filters.sendingDateFrom && sendingDate < new Date(filters.sendingDateFrom)) return false;
      if (filters.sendingDateTo) {
        const endDate = new Date(filters.sendingDateTo);
        endDate.setHours(23, 59, 59, 999);
        if (sendingDate > endDate) return false;
      }
    }

    if (filters.totalAmountFrom || filters.totalAmountTo) {
      if (amount == null) return false;
      if (filters.totalAmountFrom && amount < Number(filters.totalAmountFrom)) return false;
      if (filters.totalAmountTo && amount > Number(filters.totalAmountTo)) return false;
    }

    return true;
  });

  setFilteredRows(result);
  setCurrentPage(1);
  setSelectedRow(null);
};

  const handleReset = () => {
    setFilters({
      appReference: "",
      senderReference: "",
      status: "",
      category: "",
      sender: "",
      flowType: "",
      sendingDateFrom: "",
      sendingDateTo: "",
      totalAmountFrom: "",
      totalAmountTo: "",
    });
    setFilteredRows(rows);
    setCurrentPage(1);
    setSelectedRow(null);
  };

  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE) || 1;

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRows, currentPage]);

  return (
    <div className="filein-page-bootstrap">
      {urlStatus && (
        <div className="filein-status-banner">
          Filtré par statut : <strong>{urlStatus}</strong>
          <span className="filein-status-count">
            {filteredRows.length} résultat(s)
          </span>
        </div>
      )}

      <FileInFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        onSearch={handleSearch}
        senderOptions={senderOptions}
        flowTypeOptions={flowTypeOptions}
      />

      <div className="filein-card">
        <div className="filein-card-title">
          <span>
            Search Result : <span className="accent">File IN</span>
          </span>
          <span className="filein-results-badge">
            {loading
              ? "Loading..."
              : filteredRows.length === rows.length
              ? `${rows.length.toLocaleString()} total`
              : `${filteredRows.length.toLocaleString()} results`}
          </span>
        </div>

        <FileInTable
          rows={paginatedRows}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
          loading={loading}
        />

        <div className="filein-footer">
          <div className="filein-pagination">
            <button
              type="button"
              className="filein-btn-page"
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>

            <span>
              Page {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              className="filein-btn-page"
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}