import { useEffect, useMemo, useState } from "react";
import {
  getSenders,
  addSender,
  updateSender,
  deleteSender,
} from "../services/senderService";
import "../../fonctionnel/styles/FileInPage.css";

const ITEMS_PER_PAGE = 10;

export default function SendersPage() {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formData, setFormData] = useState({ sender: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getSenders();
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setRows(data);
    } catch (error) {
      console.error("Error loading senders:", error);
      alert("Failed to load senders");
    }
  };

  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE) || 1;

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return rows.slice(start, start + ITEMS_PER_PAGE);
  }, [rows, currentPage]);

  const handleOpenAdd = () => {
    setEditingRow(null);
    setFormData({ sender: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (row) => {
    setEditingRow(row);
    setFormData({ sender: row.sender || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.sender.trim()) {
      alert("Sender is required");
      return;
    }

    try {
      if (editingRow) {
        await updateSender(editingRow.idSender, formData);
        alert("Sender updated successfully");
      } else {
        await addSender(formData);
        alert("Sender added successfully");
      }

      setShowModal(false);
      setFormData({ sender: "" });
      setEditingRow(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Operation failed");
    }
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm(`Delete sender "${row.sender}" ?`);
    if (!confirmed) return;

    try {
      await deleteSender(row.idSender);
      alert("Sender deleted successfully");
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  return (
    <div className="filein-page-bootstrap">
      <div className="filein-card mb-4">
        <div className="filein-card-title">
          <span>
            Technical Management :{" "}
            <span style={{ color: "#a371f7" }}>Senders</span>
          </span>
        </div>

        <div className="filein-card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h4 style={{ color: "#e6edf3", marginBottom: "6px" }}>
                Senders Management
              </h4>
              <p style={{ color: "#8b949e", margin: 0, fontSize: "13px" }}>
                Add, update, and maintain sender reference data.
              </p>
            </div>

            <button className="btn filein-btn-search" onClick={handleOpenAdd}>
              + Add Sender
            </button>
          </div>
        </div>
      </div>

      <div className="filein-card">
        <div className="filein-card-title">
          <span>
            Search Result : <span style={{ color: "#a371f7" }}>Senders</span>
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
            {rows.length.toLocaleString()} results
          </span>
        </div>

        <div className="filein-table-wrap">
          <table className="table filein-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: "140px" }}>ID Sender</th>
                <th>Sender</th>
                <th style={{ width: "220px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "40px" }}>
                    No sender found
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.idSender}>
                    <td className="mono">{row.idSender}</td>
                    <td title={row.sender}>{row.sender}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="filein-btn-edit"
                          onClick={() => handleOpenEdit(row)}
                        >
                          Edit
                        </button>
                        <button
                          className="filein-btn-force"
                          onClick={() => handleDelete(row)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="filein-action-bar">
          <div className="filein-pagination">
            <button
              className="filein-btn-page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="filein-btn-page"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="filein-modal-backdrop preview-overlay" onClick={() => setShowModal(false)}>
          <div
            className="filein-modal-content modal-content"
            style={{ maxWidth: "500px", margin: "80px auto", padding: "0" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="d-flex justify-content-between align-items-center"
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #21262d",
              }}
            >
              <h5 style={{ margin: 0 }}>
                {editingRow ? "Edit Sender" : "Add Sender"}
              </h5>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#c9d1d9",
                  fontSize: "20px",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <label className="filein-label mb-2">Sender</label>
              <input
                type="text"
                value={formData.sender}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sender: e.target.value }))
                }
                placeholder="Enter sender"
                className="form-control filein-input"
              />
            </div>

            <div
              className="d-flex justify-content-end gap-2"
              style={{ padding: "0 20px 20px" }}
            >
              <button className="btn filein-btn-reset" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn filein-btn-search" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}