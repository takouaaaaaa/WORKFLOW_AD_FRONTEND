import { useEffect, useMemo, useState } from "react";
import {
  getSenders,
  addSender,
  updateSender,
  deleteSender,
} from "../services/senderService";
import "../../fonctionnel/pages/FileInPage.css";

const ITEMS_PER_PAGE = 10;

export default function SendersPage() {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [formData, setFormData] = useState({
    sender: "",
  });

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
    setFormData({
      sender: row.sender || "",
    });
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
    <div className="filein-page">
      <div className="filein-search-card">
        <div className="filein-card-title">Senders Management</div>

        <div className="filein-search-actions" style={{ paddingTop: "16px" }}>
          <div />
          <button className="btn search" onClick={handleOpenAdd}>
            + Add Sender
          </button>
        </div>
      </div>

      <div className="filein-result-card">
        <div className="filein-card-title">Senders List</div>

        <div className="filein-table-wrapper">
          <table className="filein-table">
            <thead>
              <tr>
                <th>ID Sender</th>
                <th>Sender</th>
                <th style={{ width: "180px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="3">No sender found</td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.idSender}>
                    <td className="mono">{row.idSender}</td>
                    <td>{row.sender}</td>
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
              <h3>{editingRow ? "Edit Sender" : "Add Sender"}</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-content">
              <label>Sender</label>
              <input
                type="text"
                value={formData.sender}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sender: e.target.value }))
                }
                placeholder="Enter sender"
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