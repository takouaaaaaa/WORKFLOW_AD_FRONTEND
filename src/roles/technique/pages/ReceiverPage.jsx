import { useEffect, useMemo, useState } from "react";
import {
  getReceivers,
  addReceiver,
  updateReceiver,
  deleteReceiver,
} from "../services/receiverService";
import CrudModal from "../components/Crudmodal";
import "../../fonctionnel/styles/FileInpage.css"; 

const ITEMS_PER_PAGE = 10;

export default function ReceiversPage() {
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
      const res = await getReceivers();
      setRows(Array.isArray(res.data) ? res.data : res.data.content || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load receivers");
    }
  };

  const filteredRows = useMemo(() => {
    const f = appliedFilter.trim().toLowerCase();
    return !f
      ? rows
      : rows.filter((r) =>
          String(r.receiver || "").toLowerCase().includes(f)
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
    setFormValue(row.receiver || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formValue.trim()) {
      alert("Receiver is required");
      return;
    }

    try {
      if (editingRow) {
        await updateReceiver(editingRow.idReceiver, { receiver: formValue });
      } else {
        await addReceiver({ receiver: formValue });
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
    if (!window.confirm(`Delete receiver "${row.receiver}"?`)) return;

    try {
      await deleteReceiver(row.idReceiver);
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
            Technical Management : <span className="accent">Receivers</span>
          </span>
        </div>

        <div className="filein-card-body">
          <div className="filein-page-header">
            <div>
              <h4>Receivers Management</h4>
              <p>Add, update, and maintain receiver reference data.</p>
            </div>

            <button className="filein-btn-search" onClick={handleOpenAdd}>
              + Add Receiver
            </button>
          </div>
        </div>
      </div>

      <div className="filein-card">
        <div className="filein-card-title">
          <span>
            Search Result : <span className="accent">Receivers</span>
          </span>
          <span className="filein-results-badge">
            {filteredRows.length.toLocaleString()} results
          </span>
        </div>

        <div className="filein-card-body">
          <div className="filein-search-row">
            <div className="filein-filter-field filein-filter-grow">
              <label className="filein-label">Receiver</label>
              <input
                type="text"
                className="filein-input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by receiver name"
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
                <th style={{ width: "140px" }}>ID Receiver</th>
                <th>Receiver</th>
                <th style={{ width: "220px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="filein-table-empty">
                    No receiver found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.idReceiver}>
                    <td className="mono">{row.idReceiver}</td>
                    <td title={row.receiver}>{row.receiver}</td>
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
        title={editingRow ? "Edit Receiver" : "Add Receiver"}
        label="Receiver"
        value={formValue}
        onChange={setFormValue}
        placeholder="Enter receiver name"
        onSave={handleSave}
      />
    </div>
  );
}