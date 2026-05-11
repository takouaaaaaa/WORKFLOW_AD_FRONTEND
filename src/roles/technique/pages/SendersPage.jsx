import { useEffect, useMemo, useState } from "react";
import {
  getSenders,
  addSender,
  updateSender,
  deleteSender,
} from "../services/senderService";
import CrudModal from "../components/Crudmodal";
import "../../fonctionnel/styles/FileInpage.css";

const ITEMS_PER_PAGE = 10;

export default function SendersPage() {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValue, setFormValue] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getSenders();
      setRows(Array.isArray(res.data) ? res.data : res.data.content || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load senders");
    }
  };

  const filteredRows = useMemo(() => {
    const f = appliedFilter.trim().toLowerCase();
    return !f
      ? rows
      : rows.filter((r) =>
          String(r.sender || "").toLowerCase().includes(f)
        );
  }, [rows, appliedFilter]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRows, currentPage]);

  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE) || 1;

  const handleSearch = () => {
    setAppliedFilter(searchInput.trim());
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setEditingRow(null);
    setFormValue("");
    setShowModal(true);
  };

  const handleOpenEdit = (row) => {
    setEditingRow(row);
    setFormValue(row.sender || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formValue.trim()) {
      alert("Sender is required");
      return;
    }

    try {
      if (editingRow) {
        await updateSender(editingRow.idSender, { sender: formValue });
      } else {
        await addSender({ sender: formValue });
      }

      setShowModal(false);
      setFormValue("");
      setEditingRow(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Operation failed");
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete sender "${row.sender}"?`)) return;

    try {
      await deleteSender(row.idSender);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  return (
    <div className="filein-page-bootstrap">
      <div className="filein-card">
        <div className="filein-card-title">
          <span>
            Technical Management : <span className="accent">Senders</span>
          </span>
        </div>

        <div className="filein-card-body">
          <div className="filein-page-header">
            <div>
              <h4>Senders Management</h4>
              <p>Add, update, and maintain sender reference data.</p>
            </div>

            <button className="filein-btn-search" onClick={handleOpenAdd}>
              + Add Sender
            </button>
          </div>
        </div>
      </div>

      <div className="filein-card">
        <div className="filein-card-title">
          <span>
            Search Result : <span className="accent">Senders</span>
          </span>
          <span className="filein-results-badge">
            {filteredRows.length.toLocaleString()} results
          </span>
        </div>

        <div className="filein-card-body">
          <div className="filein-search-row">
            <div className="filein-filter-field filein-filter-grow">
              <label className="filein-label">Sender</label>
              <input
                type="text"
                className="filein-input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by sender name"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <button className="filein-btn-search" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        <div className="filein-table-wrap">
          <table className="filein-table">
            <thead>
              <tr>
                <th style={{ width: "120px" }}>ID Sender</th>
                <th>Sender</th>
                <th style={{ width: "220px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="filein-table-empty">
                    No sender found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.idSender}>
                    <td className="mono">{row.idSender}</td>
                    <td title={row.sender}>{row.sender}</td>
                    <td>
                      <div className="filein-row-actions">
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
              ← Prev
            </button>

            <span>
              Page {currentPage} / {totalPages}
            </span>

            <button
              className="filein-btn-page"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <CrudModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingRow ? "Edit Sender" : "Add Sender"}
        label="Sender"
        value={formValue}
        onChange={setFormValue}
        placeholder="Enter sender name"
        onSave={handleSave}
      />
    </div>
  );
}