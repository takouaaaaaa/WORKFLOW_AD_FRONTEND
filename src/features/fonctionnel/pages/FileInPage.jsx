import { useEffect, useMemo, useState } from "react";
import {
  getFileIns,
  downloadFileIn,
  updateFileIn,
  forceFileIn,
  rejectFileIn,
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
    appReference: "",
    senderReference: "",
    status: "",
    category: "",
    sender: "",
    receiver: "",
    flowType: "",
    sendingDateFrom: "",
    sendingDateTo: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getFileIns();
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];

      setRows(data);
      setFilteredRows(data);
      setSelectedRow(null);
      setCurrentPage(1);

      const senders = [
        ...new Set(
          data
            .map((row) => row?.flux?.sender?.sender)
            .filter((value) => value && value.trim() !== "")
        ),
      ].sort((a, b) => a.localeCompare(b));

      // Receiver n'existe pas dans FileIn -> on laisse vide
      const receivers = [];

      const flowTypes = [
        ...new Set(
          data
            .map(
              (row) =>
                row?.flux?.typeFlux?.flowType ||
                row?.flux?.typeFlux?.FlowType ||
                ""
            )
            .filter((value) => value && value.trim() !== "")
        ),
      ].sort((a, b) => a.localeCompare(b));

      setSenderOptions(senders);
      setReceiverOptions(receivers);
      setFlowTypeOptions(flowTypes);
    } catch (error) {
      console.error(error);
      alert("Failed to load File IN data");
    }
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
      const appReference = row?.appReference || row?.flux?.appReference || "";
      const senderReference = row?.flux?.senderReference || "";
      const status = row?.flux?.statut || "";
      const category = row?.category || "";
      const sender = row?.flux?.sender?.sender || "";
      const receiver = "";
      const flowType =
        row?.flux?.typeFlux?.flowType || row?.flux?.typeFlux?.FlowType || "";
      const sendingDate = row?.sendingDate ? new Date(row.sendingDate) : null;

      const matchAppReference = appReference
        .toLowerCase()
        .includes(filters.appReference.toLowerCase());

      const matchSenderReference = senderReference
        .toLowerCase()
        .includes(filters.senderReference.toLowerCase());

      const matchStatus = !filters.status || status === filters.status;
      const matchCategory = !filters.category || category === filters.category;
      const matchSender = !filters.sender || sender === filters.sender;
      const matchReceiver = !filters.receiver || receiver === filters.receiver;
      const matchFlowType = !filters.flowType || flowType === filters.flowType;

      let matchDateFrom = true;
      let matchDateTo = true;

      if (filters.sendingDateFrom) {
        if (!sendingDate) {
          matchDateFrom = false;
        } else {
          matchDateFrom = sendingDate >= new Date(filters.sendingDateFrom);
        }
      }

      if (filters.sendingDateTo) {
        if (!sendingDate) {
          matchDateTo = false;
        } else {
          const endDate = new Date(filters.sendingDateTo);
          endDate.setHours(23, 59, 59, 999);
          matchDateTo = sendingDate <= endDate;
        }
      }

      return (
        matchAppReference &&
        matchSenderReference &&
        matchStatus &&
        matchCategory &&
        matchSender &&
        matchReceiver &&
        matchFlowType &&
        matchDateFrom &&
        matchDateTo
      );
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
      receiver: "",
      flowType: "",
      sendingDateFrom: "",
      sendingDateTo: "",
    });

    setFilteredRows(rows);
    setCurrentPage(1);
    setSelectedRow(null);
  };

  const handleView = () => {
    if (!selectedRow) {
      alert("Select one row first");
      return;
    }
    setShowView(true);
  };

  const handleEdit = () => {
    if (!selectedRow) {
      alert("Select one row first");
      return;
    }

    setEditData({
      category: selectedRow.category || "",
      description: selectedRow?.flux?.description || "",
    });

    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRow) return;

    try {
      await updateFileIn(selectedRow.idFluxIn, {
        ...selectedRow,
        category: editData.category,
      });

      alert("Updated successfully");
      setShowEdit(false);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Error updating file");
    }
  };

  const handleDownload = async () => {
    if (!selectedRow) {
      alert("Select one row first");
      return;
    }

    try {
      const res = await downloadFileIn(selectedRow.idFluxIn);

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `filein-${selectedRow.idFluxIn}.pdf`);

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to download PDF");
    }
  };

  const handleForce = async () => {
    if (!selectedRow) {
      alert("Select one row first");
      return;
    }

    try {
      await forceFileIn(selectedRow.idFluxIn);
      await fetchData();
      alert("File forced successfully");
    } catch (error) {
      console.error(error);
      alert("Error while forcing file");
    }
  };

  const handleReject = async () => {
    if (!selectedRow) {
      alert("Select one row first");
      return;
    }

    try {
      await rejectFileIn(selectedRow.idFluxIn);
      await fetchData();
      alert("File rejected successfully");
    } catch (error) {
      console.error(error);
      alert("Error while rejecting file");
    }
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

  const truncate = (text, max = 28) => {
    if (!text) return "—";
    return text.length > max ? text.substring(0, max) + "..." : text;
  };

  const statusClass = (s) => {
    if (!s) return "";
    if (["PROCESSED", "ARCHIVED"].includes(s)) return "processed";
    if (["INPROCESS", "INIT", "INITIATED"].includes(s)) return "inprocess";
    if (
      ["REJECTED", "BLOCKED", "INTECHNICALERROR", "INBUSINESSERROR"].includes(s)
    ) {
      return "error";
    }
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

      <div className="filein-action-bar d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="filein-pagination d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-light btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="btn btn-outline-light btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button className="btn filein-btn-primary btn-sm" onClick={handleView}>
            View
          </button>
          <button className="btn filein-btn-primary btn-sm" onClick={handleEdit}>
            Edit
          </button>
          <button
            className="btn filein-btn-primary btn-sm"
            onClick={handleDownload}
          >
            Download
          </button>
          <button className="btn filein-btn-primary btn-sm" onClick={handleForce}>
            Force
          </button>
          <button className="btn filein-btn-danger btn-sm" onClick={handleReject}>
            Reject
          </button>
        </div>
      </div>

      <FileInViewModal
        show={showView}
        onClose={() => setShowView(false)}
        selectedRow={selectedRow}
        formatDate={formatDate}
      />

      <FileInEditModal
        show={showEdit}
        onClose={() => setShowEdit(false)}
        editData={editData}
        setEditData={setEditData}
        onSave={handleSaveEdit}
      />
    </div>
  );
}