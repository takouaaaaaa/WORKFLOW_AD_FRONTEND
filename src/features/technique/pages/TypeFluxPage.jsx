import { useEffect, useMemo, useState } from "react";
import {
  getTypeFluxes,
  addTypeFlux,
  updateTypeFlux,
  deleteTypeFlux,
} from "../services/typeFluxService";
import "../../fonctionnel/pages/FileInPage.css";

const ITEMS_PER_PAGE = 10;

export default function TypeFluxPage() {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [formData, setFormData] = useState({
    flowType: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getTypeFluxes();
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setRows(data);
    } catch (error) {
      console.error("Error loading type flux:", error);
      alert("Failed to load type flux");
    }
  };

  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE) || 1;

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return rows.slice(start, start + ITEMS_PER_PAGE);
  }, [rows, currentPage]);

  const handleOpenAdd = () => {
    setEditingRow(null);
    setFormData({ flowType: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (row) => {
    setEditingRow(row);
    setFormData({
      flowType: row.flowType || row.FlowType || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.flowType.trim()) {
      alert("Flow Type is required");
      return;
    }

    try {
      const payload = { flowType: formData.flowType };

      if (editingRow) {
        await updateTypeFlux(editingRow.idTypeFlux, payload);
        alert("TypeFlux updated successfully");
      } else {
        await addTypeFlux(payload);
        alert("TypeFlux added successfully");
      }

      setShowModal(false);
      setFormData({ flowType: "" });
      setEditingRow(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Operation failed");
    }
  };

  const handleDelete = async (row) => {
    const value = row.flowType || row.FlowType || "";
    const confirmed = window.confirm(`Delete type flux "${value}" ?`);
    if (!confirmed) return;

    try {
      await deleteTypeFlux(row.idTypeFlux);
      alert("TypeFlux deleted successfully");
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  return (
    <div className="filein-page">
      <div className="filein-search-card">
        <div className="filein-card-title">Type Flux Management</div>

        <div className="filein-search-actions" style={{ paddingTop: "16px" }}>
          <div />
          <button className="btn search" onClick={handleOpenAdd}>
            + Add Type Flux
          </button>
        </div>
      </div>

      <div className="filein-result-card">
        <div className="filein-card-title">Type Flux List</div>

        <div className="filein-table-wrapper">
          <table className="filein-table">
            <thead>
              <tr>
                <th>ID TypeFlux</th>
                <th>Flow Type</th>
                <th style={{ width: "180px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="3">No type flux found</td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.idTypeFlux}>
                    <td className="mono">{row.idTypeFlux}</td>
                    <td>{row.flowType || row.FlowType}</td>
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
              <h3>{editingRow ? "Edit Type Flux" : "Add Type Flux"}</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-content">
              <label>Flow Type</label>
              <input
                type="text"
                value={formData.flowType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, flowType: e.target.value }))
                }
                placeholder="Enter flow type"
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