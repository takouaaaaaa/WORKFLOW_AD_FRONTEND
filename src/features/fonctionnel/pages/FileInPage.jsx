import { useEffect, useMemo, useState } from "react";
import {
  getFileIns, downloadFileIn, updateFileIn, forceFileIn, rejectFileIn,
} from "../services/fileInService";
import FileInFilters from "../components/FileInFilters";
import FileInTable from "../components/FileInTable";
import FileInViewModal from "../components/FileInViewModal";
import FileInEditModal from "../components/FileInEditModal";
import "../styles/FileInPage.css";

const ITEMS_PER_PAGE = 10;

export default function FileInPage() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({});
  const [senderOptions, setSenderOptions] = useState([]);
  const [receiverOptions, setReceiverOptions] = useState([]);
  const [flowTypeOptions, setFlowTypeOptions] = useState([]);

  const [filters, setFilters] = useState({
    appReference: "", senderReference: "", status: "", category: "",
    sender: "", receiver: "", flowType: "", sendingDateFrom: "", sendingDateTo: "",
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getFileIns();
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setRows(data);
      setFilteredRows(data);
      setSelectedRow(null);
      setCurrentPage(1);

      setSenderOptions([...new Set(data.map((r) => r?.flux?.sender?.sender).filter(Boolean))].sort());
      setReceiverOptions([]);
      setFlowTypeOptions([...new Set(data.map((r) => r?.flux?.typeFlux?.flowType || r?.flux?.typeFlux?.FlowType || "").filter(Boolean))].sort());
    } catch (error) {
      console.error(error);
      alert("Failed to load File IN data");
    }
  };

  const handleFilterChange = (e) => setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSearch = () => {
    let result = [...rows].filter((row) => {
      const appRef = row?.appReference || row?.flux?.appReference || "";
      const senderRef = row?.flux?.senderReference || "";
      const status = row?.flux?.statut || "";
      const category = row?.category || "";
      const sender = row?.flux?.sender?.sender || "";
      const flowType = row?.flux?.typeFlux?.flowType || row?.flux?.typeFlux?.FlowType || "";
      const sendingDate = row?.sendingDate ? new Date(row.sendingDate) : null;

      const matchDate = (from, to) => {
        if (!from && !to) return true;
        if (!sendingDate) return false;
        if (from && sendingDate < new Date(from)) return false;
        if (to) { const end = new Date(to); end.setHours(23, 59, 59, 999); if (sendingDate > end) return false; }
        return true;
      };

      return (
        appRef.toLowerCase().includes(filters.appReference.toLowerCase()) &&
        senderRef.toLowerCase().includes(filters.senderReference.toLowerCase()) &&
        (!filters.status || status === filters.status) &&
        (!filters.category || category === filters.category) &&
        (!filters.sender || sender === filters.sender) &&
        (!filters.flowType || flowType === filters.flowType) &&
        matchDate(filters.sendingDateFrom, filters.sendingDateTo)
      );
    });
    setFilteredRows(result);
    setCurrentPage(1);
    setSelectedRow(null);
  };

  const handleReset = () => {
    setFilters({ appReference: "", senderReference: "", status: "", category: "", sender: "", receiver: "", flowType: "", sendingDateFrom: "", sendingDateTo: "" });
    setFilteredRows(rows);
    setCurrentPage(1);
    setSelectedRow(null);
  };

  const requireSelection = (cb) => () => { if (!selectedRow) { alert("Select one row first"); return; } cb(); };

  const handleView = requireSelection(() => setShowView(true));
  const handleEdit = requireSelection(() => {
    setEditData({ category: selectedRow.category || "", description: selectedRow?.flux?.description || "" });
    setShowEdit(true);
  });

  const handleSaveEdit = async () => {
    try {
      await updateFileIn(selectedRow.idFluxIn, { ...selectedRow, category: editData.category });
      alert("Updated successfully");
      setShowEdit(false);
      await fetchData();
    } catch (e) { console.error(e); alert("Error updating file"); }
  };

  const handleDownload = requireSelection(async () => {
    try {
      const res = await downloadFileIn(selectedRow.idFluxIn);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `filein-${selectedRow.idFluxIn}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) { console.error(e); alert("Failed to download PDF"); }
  });

  const handleForce = requireSelection(async () => {
    try { await forceFileIn(selectedRow.idFluxIn); await fetchData(); alert("File forced successfully"); }
    catch (e) { console.error(e); alert("Error while forcing file"); }
  });

  const handleReject = requireSelection(async () => {
    try { await rejectFileIn(selectedRow.idFluxIn); await fetchData(); alert("File rejected successfully"); }
    catch (e) { console.error(e); alert("Error while rejecting file"); }
  });

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

  const truncate = (text, max = 28) => {
    if (!text) return "—";
    return text.length > max ? text.substring(0, max) + "..." : text;
  };

  const statusClass = (s) => {
    if (!s) return "";
    if (["PROCESSED", "ARCHIVED"].includes(s)) return "processed";
    if (["INPROCESS", "INIT", "INITIATED"].includes(s)) return "inprocess";
    if (["REJECTED", "BLOCKED", "INTECHNICALERROR", "INBUSINESSERROR"].includes(s)) return "error";
    return "wait";
  };

  return (
    <div className="filein-page-bootstrap">
      <FileInFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        onSearch={handleSearch}
        senderOptions={senderOptions}
        receiverOptions={receiverOptions}
        flowTypeOptions={flowTypeOptions}
      />

      <FileInTable
        rows={paginatedRows}
        totalCount={filteredRows.length}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        truncate={truncate}
        formatDate={formatDate}
        statusClass={statusClass}
      />

      <div className="filein-action-bar">
        <div className="filein-pagination">
          <button className="filein-btn-page" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>← Prev</button>
          <span>Page {currentPage} / {totalPages}</span>
          <button className="filein-btn-page" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next →</button>
        </div>

        <div className="filein-action-buttons">
          <button className="filein-btn-view" onClick={handleView}>View</button>
          <button className="filein-btn-edit" onClick={handleEdit}>Edit</button>
          <button className="filein-btn-download" onClick={handleDownload}>Download</button>
          <button className="filein-btn-primary" onClick={handleForce}>Force</button>
          <button className="filein-btn-danger" onClick={handleReject}>Reject</button>
        </div>
      </div>

      <FileInViewModal show={showView} onClose={() => setShowView(false)} selectedRow={selectedRow} formatDate={formatDate} />
      <FileInEditModal show={showEdit} onClose={() => setShowEdit(false)} editData={editData} setEditData={setEditData} onSave={handleSaveEdit} />
    </div>
  );
}