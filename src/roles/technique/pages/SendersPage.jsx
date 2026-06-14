import { useEffect, useMemo, useState } from "react";
import {
  getSenders,
  addSender,
  updateSender,
  deleteSender,
} from "../services/senderService";
import CrudModal from "../components/Crudmodal";
import "../styles/SearchTechnique.css";

const ITEMS_PER_PAGE = 10;

export default function SendersPage() {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValue, setFormValue] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    row: null,
    title: "",
    message: "",
  });

  const [errorModal, setErrorModal] = useState({
    show: false,
    title: "",
    message: "",
  });

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

  const handleDelete = (row) => {
    setConfirmModal({
      show: true,
      row,
      title: "Confirm Deletion",
      message: `Are you sure you want to delete sender "${row.sender}"?`,
    });
  };

  const confirmDelete = async () => {
    if (!confirmModal.row) return;

    try {
      await deleteSender(confirmModal.row.idSender);
      await fetchData();

      setConfirmModal({
        show: false,
        row: null,
        title: "",
        message: "",
      });
    } catch (error) {
      console.error(error);

      setConfirmModal({
        show: false,
        row: null,
        title: "",
        message: "",
      });

      setErrorModal({
        show: true,
        title: "Deletion Not Allowed",
        message:
          "This sender is linked to existing flows. To preserve data integrity, this reference cannot be deleted.",
      });
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

      {confirmModal.show && (
        <div className="modal-backdrop-custom">
          <div className="modal-box-custom">
            <div className="modal-icon-warning">!</div>

            <h3>{confirmModal.title}</h3>
            <p>{confirmModal.message}</p>

            <div className="modal-actions-custom">
              <button
                className="modal-btn-cancel"
                onClick={() =>
                  setConfirmModal({
                    show: false,
                    row: null,
                    title: "",
                    message: "",
                  })
                }
              >
                Cancel
              </button>

              <button className="modal-btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {errorModal.show && (
        <div className="modal-backdrop-custom">
          <div className="modal-box-custom">
            <div className="modal-icon-error">×</div>

            <h3>{errorModal.title}</h3>
            <p>{errorModal.message}</p>

            <button
              className="modal-btn-primary"
              onClick={() =>
                setErrorModal({
                  show: false,
                  title: "",
                  message: "",
                })
              }
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}