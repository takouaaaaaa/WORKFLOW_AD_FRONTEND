import { useEffect, useMemo, useState } from "react";
import {
  getTypeFluxes,
  addTypeFlux,
  updateTypeFlux,
  deleteTypeFlux,
} from "../services/typeFluxService";

import CrudModal from "../components/Crudmodal";
import "../styles/SearchTechnique.css";

const ITEMS_PER_PAGE = 10;

export default function TypeFluxPage() {
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
      const res = await getTypeFluxes();
      setRows(Array.isArray(res.data) ? res.data : res.data.content || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load flow types");
    }
  };

  const filteredRows = useMemo(() => {
    const f = appliedFilter.trim().toLowerCase();

    return !f
      ? rows
      : rows.filter((r) =>
          String(r.flowType || r.FlowType || "")
            .toLowerCase()
            .includes(f)
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
    setFormValue(row.flowType || row.FlowType || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formValue.trim()) {
      alert("Flow type is required");
      return;
    }

    try {
      if (editingRow) {
        await updateTypeFlux(editingRow.idTypeFlux, {
          flowType: formValue,
        });
      } else {
        await addTypeFlux({
          flowType: formValue,
        });
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
    const val = row.flowType || row.FlowType || "";

    setConfirmModal({
      show: true,
      row,
      title: "Confirm Deletion",
      message: `Are you sure you want to delete flow type "${val}"?`,
    });
  };

  const confirmDelete = async () => {
    if (!confirmModal.row) return;

    try {
      await deleteTypeFlux(confirmModal.row.idTypeFlux);
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
          "This flow type is linked to existing flows. To preserve data integrity, this reference cannot be deleted.",
      });
    }
  };

  return (
    <div className="filein-page-bootstrap">
      <div className="filein-card">
        <div className="filein-card-title">
          <span>
            Technical Management :
            <span className="accent"> Flow Types</span>
          </span>
        </div>

        <div className="filein-card-body">
          <div className="filein-page-header">
            <div>
              <h4>Flow Type Management</h4>
              <p>Add, update, and maintain flow type reference data.</p>
            </div>

            <button className="filein-btn-search" onClick={handleOpenAdd}>
              + Add Flow Type
            </button>
          </div>
        </div>
      </div>

      <div className="filein-card">
        <div className="filein-card-title">
          <span>
            Search Result :
            <span className="accent"> Flow Types</span>
          </span>

          <span className="filein-results-badge">
            {filteredRows.length.toLocaleString()} results
          </span>
        </div>

        <div className="filein-card-body">
          <div className="filein-search-row">
            <div className="filein-filter-field">
              <label className="filein-label">Flow Type</label>

              <input
                type="text"
                className="filein-input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by flow type"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <button className="filein-btn-search" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        <div className="filein-table-wrap">
          <table className="filein-table" style={{ tableLayout: "auto" }}>
            <thead>
              <tr>
                <th style={{ width: "140px" }}>Flow Type ID</th>
                <th>Flow Type</th>
                <th style={{ width: "200px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="filein-table-empty">
                    No flow types found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.idTypeFlux}>
                    <td className="mono">{row.idTypeFlux}</td>

                    <td title={row.flowType || row.FlowType}>
                      {row.flowType || row.FlowType}
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
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
        title={editingRow ? "Edit Flow Type" : "Add Flow Type"}
        label="Flow Type"
        value={formValue}
        onChange={setFormValue}
        placeholder="Enter flow type"
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