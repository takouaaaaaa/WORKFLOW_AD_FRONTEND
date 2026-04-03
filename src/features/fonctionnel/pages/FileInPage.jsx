import { useEffect, useMemo, useState } from "react";
import {
  getFileIns,
  downloadFileIn,
  updateFileIn,
  forceFileIn,
  rejectFileIn,
} from "../services/fileInService";
import "./FileInPage.css";

const ITEMS_PER_PAGE = 10;

export default function FileInPage() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);

  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({});

  const [filters, setFilters] = useState({
    appReference: "",
    senderReference: "",
    status: "",
    category: "",
    sender: "",
    receiver: "",
    sendingDateFrom: "",
    sendingDateTo: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getFileIns();
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
      const senderReference = row.senderReference || "";
      const status = row.statutFluxIn || "";
      const category = row.category || "";
      const sender = row.flux?.sender?.sender || "";
      const receiver = row.flux?.receiver?.receiver || "";
      const sendingDate = row.sendingDate ? new Date(row.sendingDate) : null;

      const matchAppReference = appReference
        .toLowerCase()
        .includes(filters.appReference.toLowerCase());

      const matchSenderReference = senderReference
        .toLowerCase()
        .includes(filters.senderReference.toLowerCase());

      const matchStatus = !filters.status || status === filters.status;
      const matchCategory = !filters.category || category === filters.category;

      const matchSender = sender
        .toLowerCase()
        .includes(filters.sender.toLowerCase());

      const matchReceiver = receiver
        .toLowerCase()
        .includes(filters.receiver.toLowerCase());

      let matchDateFrom = true;
      let matchDateTo = true;

      if (filters.sendingDateFrom && sendingDate) {
        matchDateFrom = sendingDate >= new Date(filters.sendingDateFrom);
      }

      if (filters.sendingDateTo && sendingDate) {
        const endDate = new Date(filters.sendingDateTo);
        endDate.setHours(23, 59, 59, 999);
        matchDateTo = sendingDate <= endDate;
      }

      return (
        matchAppReference &&
        matchSenderReference &&
        matchStatus &&
        matchCategory &&
        matchSender &&
        matchReceiver &&
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
      statutFluxIn: selectedRow.statutFluxIn || "",
      category: selectedRow.category || "",
      message: selectedRow.message || "",
    });

    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRow) return;

    try {
      await updateFileIn(selectedRow.idFluxIn, {
        ...selectedRow,
        statutFluxIn: editData.statutFluxIn,
        category: editData.category,
        message: editData.message,
      });

      alert("Updated successfully");
      setShowEdit(false);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Error updating file");
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
    if (["REJECTED", "BLOCKED", "INTECHNICALERROR", "INBUSINESSERROR"].includes(s)) return "error";
    return "wait";
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

  return (
    <div className="filein-page">
      <div className="filein-search-card">
        <div className="filein-card-title">Detailed Search : File IN</div>

        <div className="filein-search-grid">
          <div className="field">
            <label>App Reference</label>
            <input
              name="appReference"
              value={filters.appReference}
              onChange={handleFilterChange}
              placeholder="Search app reference"
            />
          </div>

          <div className="field">
            <label>Sender Reference</label>
            <input
              name="senderReference"
              value={filters.senderReference}
              onChange={handleFilterChange}
              placeholder="Search sender reference"
            />
          </div>

          <div className="field">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="PROCESSED">PROCESSED</option>
              <option value="INPROCESS">INPROCESS</option>
              <option value="REJECTED">REJECTED</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="INITIATED">INITIATED</option>
            </select>
          </div>

          <div className="field">
            <label>Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="ACQUISITION">ACQUISITION</option>
              <option value="RESTITUTION">RESTITUTION</option>
            </select>
          </div>

          <div className="field">
            <label>Sender</label>
            <input
              name="sender"
              value={filters.sender}
              onChange={handleFilterChange}
              placeholder="Search sender"
            />
          </div>

          <div className="field">
            <label>Receiver</label>
            <input
              name="receiver"
              value={filters.receiver}
              onChange={handleFilterChange}
              placeholder="Search receiver"
            />
          </div>

          <div className="field">
            <label>Sending Date From</label>
            <input
              type="date"
              name="sendingDateFrom"
              value={filters.sendingDateFrom}
              onChange={handleFilterChange}
            />
          </div>

          <div className="field">
            <label>Sending Date To</label>
            <input
              type="date"
              name="sendingDateTo"
              value={filters.sendingDateTo}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="filein-search-actions">
          <button className="btn reset" onClick={handleReset}>Reinitialize</button>
          <button className="btn search" onClick={handleSearch}>Search</button>
        </div>
      </div>

      <div className="filein-result-card">
        <div className="filein-card-title">Search Result : File IN</div>

        <div className="filein-table-wrapper">
          <table className="filein-table">
            <thead>
              <tr>
                <th></th>
                <th>App Ref</th>
                <th>Sender Ref</th>
                <th>Sender</th>
                <th>Sending Date</th>
                <th>Status</th>
                <th>Flow Type</th>
                <th>Total Amount</th>
                <th>Settlement Date</th>
                <th>Category</th>
                <th>Message</th>
                <th>Receiver</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRows.map((row) => (
                <tr
                  key={row.idFluxIn}
                  className={selectedRow?.idFluxIn === row.idFluxIn ? "selected-row" : ""}
                >
                  <td>
                    <input
                      type="radio"
                      checked={selectedRow?.idFluxIn === row.idFluxIn}
                      onChange={() => setSelectedRow(row)}
                    />
                  </td>

                  <td className="mono">{row.flux?.appReference || "—"}</td>
                  <td className="mono">{row.senderReference || "—"}</td>
                  <td>{row.flux?.sender?.sender || "—"}</td>
                  <td>{formatDate(row.sendingDate)}</td>

                  <td>
                    <span className={`status-badge ${statusClass(row.statutFluxIn)}`}>
                      {row.statutFluxIn}
                    </span>
                  </td>

                  <td>{row.flux?.typeFlux?.flowType || row.flux?.typeFlux?.FlowType || "—"}</td>
                  <td>{row.flux?.totalAmount ?? "—"}</td>
                  <td>{formatDate(row.settlementDate)}</td>
                  <td>{row.category || "—"}</td>
                  <td title={row.message}>{truncate(row.message, 28)}</td>
                  <td>{row.flux?.receiver?.receiver || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="filein-footer">
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              Next
            </button>
          </div>

          <div className="action-buttons">
            <button className="action-btn" onClick={handleView}>View</button>
            <button className="action-btn" onClick={handleEdit}>Edit</button>
            <button className="action-btn" onClick={handleDownload}>Download</button>
            <button className="action-btn" onClick={handleForce}>Force</button>
            <button className="action-btn danger" onClick={handleReject}>Reject</button>
          </div>
        </div>
      </div>

      {showView && selectedRow && (
        <div className="preview-overlay" onClick={() => setShowView(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>File IN Details</h3>
              <button onClick={() => setShowView(false)}>✕</button>
            </div>

            <div className="modal-content">
              <p><b>ID:</b> {selectedRow.idFluxIn}</p>
              <p><b>Status:</b> {selectedRow.statutFluxIn}</p>
              <p><b>Sender Ref:</b> {selectedRow.senderReference}</p>
              <p><b>Sending Date:</b> {formatDate(selectedRow.sendingDate)}</p>
              <p><b>Settlement Date:</b> {formatDate(selectedRow.settlementDate)}</p>
              <p><b>Category:</b> {selectedRow.category}</p>
              <p><b>Message:</b> {selectedRow.message}</p>

              <hr />

              <p><b>App Ref:</b> {selectedRow.flux?.appReference || "—"}</p>
              <p><b>Flow Type:</b> {selectedRow.flux?.typeFlux?.flowType || selectedRow.flux?.typeFlux?.FlowType || "—"}</p>
              <p><b>Sender:</b> {selectedRow.flux?.sender?.sender || "—"}</p>
              <p><b>Receiver:</b> {selectedRow.flux?.receiver?.receiver || "—"}</p>
              <p><b>Total Amount:</b> {selectedRow.flux?.totalAmount ?? "—"}</p>
            </div>
          </div>
        </div>
      )}

      {showEdit && selectedRow && (
        <div className="preview-overlay" onClick={() => setShowEdit(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>Edit File IN</h3>
              <button onClick={() => setShowEdit(false)}>✕</button>
            </div>

            <div className="modal-content">
              <label>Status</label>
              <select
                value={editData.statutFluxIn || ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, statutFluxIn: e.target.value }))
                }
              >
                <option value="PROCESSED">PROCESSED</option>
                <option value="INPROCESS">INPROCESS</option>
                <option value="REJECTED">REJECTED</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="INITIATED">INITIATED</option>
              </select>

              <label>Category</label>
              <select
                value={editData.category || ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="ACQUISITION">ACQUISITION</option>
                <option value="RESTITUTION">RESTITUTION</option>
              </select>

              <label>Message</label>
              <textarea
                rows="5"
                value={editData.message || ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, message: e.target.value }))
                }
              />
            </div>

            <div className="modal-actions">
              <button className="action-btn" onClick={handleSaveEdit}>Save</button>
              <button className="action-btn danger" onClick={() => setShowEdit(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}