import { useEffect, useMemo, useState } from "react";
import {
  getReceivers,
  addReceiver,
  updateReceiver,
  deleteReceiver,
} from "../services/receiverService";
import "../../fonctionnel/pages/FileInPage.css";

const ITEMS_PER_PAGE = 10;

export default function ReceiversPage() {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [formData, setFormData] = useState({
    receiver: "",
  });

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

  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE) || 1;

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return rows.slice(start, start + ITEMS_PER_PAGE);
  }, [rows, currentPage]);

  const handleOpenAdd = () => {
    setEditingRow(null);
    setFormData({ receiver: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (row) => {
    setEditingRow(row);
    setFormData({
      receiver: row.receiver || "",
    });
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
    <div className="filein-page">
      <div className="filein-search-card">
        <div className="filein-card-title">Receivers Management</div>

        <div className="filein-search-actions" style={{ paddingTop: "16px" }}>
          <div />
          <button className="btn search" onClick={handleOpenAdd}>
            + Add Receiver
          </button>
        </div>
      </div>

      <div className="filein-result-card">
        <div className="filein-card-title">Receivers List</div>

        <div className="filein-table-wrapper">
          <table className="filein-table">
            <thead>
              <tr>
                <th>ID Receiver</th>
                <th>Receiver</th>
                <th style={{ width: "180px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="3">No receiver found</td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.idReceiver}>
                    <td className="mono">{row.idReceiver}</td>
                    <td>{row.receiver}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn"
                          onClick={() => handleOpenEdit(row)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn danger"
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

        <div className="filein-footer">
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="preview-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>{editingRow ? "Edit Receiver" : "Add Receiver"}</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-content">
              <label>Receiver</label>
              <input
                type="text"
                value={formData.receiver}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, receiver: e.target.value }))
                }
                placeholder="Enter receiver"
              />
            </div>

            <div className="modal-actions">
              <button className="action-btn" onClick={handleSave}>
                Save
              </button>
              <button
                className="action-btn danger"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}