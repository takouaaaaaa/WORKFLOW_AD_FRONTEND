import { useEffect, useMemo, useState } from "react";
import {
  getReceivers,
  addReceiver,
  updateReceiver,
  deleteReceiver,
} from "../services/receiverService";
import "../../fonctionnel/styles/FileInPage.css";

const ITEMS_PER_PAGE = 10;

export default function ReceiversPage() {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formData, setFormData] = useState({ receiver: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getReceivers();
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setRows(data);
    } catch (error) {
      console.error("Error loading receivers:", error);
      alert("Failed to load receivers");
    }
  };

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return rows.slice(start, start + ITEMS_PER_PAGE);
  }, [rows, currentPage]);

  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE) || 1;

  const handleOpenAdd = () => {
    setEditingRow(null);
    setFormData({ receiver: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (row) => {
    setEditingRow(row);
    setFormData({ receiver: row.receiver || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.receiver.trim()) {
      alert("Receiver is required");
      return;
    }

    try {
      if (editingRow) {
        await updateReceiver(editingRow.idReceiver, formData);
        alert("Receiver updated successfully");
      } else {
        await addReceiver(formData);
        alert("Receiver added successfully");
      }

      setShowModal(false);
      setFormData({ receiver: "" });
      setEditingRow(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Operation failed");
    }
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm(`Delete receiver "${row.receiver}" ?`);
    if (!confirmed) return;

    try {
      await deleteReceiver(row.idReceiver);
      alert("Receiver deleted successfully");
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
            <span style={{ color: "#a371f7" }}>Receivers</span>
          </span>
        </div>

        <div className="filein-card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h4 style={{ color: "#e6edf3", marginBottom: "6px" }}>
                Receivers Management
              </h4>
              <p style={{ color: "#8b949e", margin: 0, fontSize: "13px" }}>
                Add, update, and maintain receiver reference data.
              </p>
            </div>

            <button className="btn filein-btn-search" onClick={handleOpenAdd}>
              + Add Receiver
            </button>
          </div>
        </div>
      </div>

      <div className="filein-card">
        <div className="filein-card-title">
          <span>
            Search Result : <span style={{ color: "#a371f7" }}>Receivers</span>
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
                <th style={{ width: "140px" }}>ID Receiver</th>
                <th>Receiver</th>
                <th style={{ width: "220px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "40px" }}>
                    No receiver found
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.idReceiver}>
                    <td className="mono">{row.idReceiver}</td>
                    <td title={row.receiver}>{row.receiver}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn filein-btn-edit"
                          onClick={() => handleOpenEdit(row)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn filein-btn-force"
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
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#0d1117",
              color: "#e2e8f0",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              borderRadius: "14px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 20px",
                borderBottom: "1px solid #21262d",
              }}
            >
              <h5 style={{ margin: 0 }}>
                {editingRow ? "Edit Receiver" : "Add Receiver"}
              </h5>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#c9d1d9",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <label className="filein-label mb-2">Receiver</label>
              <input
                type="text"
                value={formData.receiver}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, receiver: e.target.value }))
                }
                placeholder="Enter receiver"
                className="form-control filein-input"
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                padding: "0 20px 20px",
              }}
            >
              <button
                className="btn filein-btn-reset"
                onClick={() => setShowModal(false)}
              >
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