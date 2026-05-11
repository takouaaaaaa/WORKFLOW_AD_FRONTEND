import { useEffect, useMemo, useState } from "react";
import { getTypeFluxes, addTypeFlux, updateTypeFlux, deleteTypeFlux } from "../services/typeFluxService";
import CrudModal from "../components/Crudmodal";
import "../../fonctionnel/styles/FileInpage.css";

const ITEMS_PER_PAGE = 10;

export default function TypeFluxPage() {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValue, setFormValue] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getTypeFluxes();
      setRows(Array.isArray(res.data) ? res.data : res.data.content || []);
    } catch { alert("Failed to load type flux"); }
  };

  const filteredRows = useMemo(() => {
    const f = appliedFilter.trim().toLowerCase();
    return !f ? rows : rows.filter((r) => String(r.flowType || r.FlowType || "").toLowerCase().includes(f));
  }, [rows, appliedFilter]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRows, currentPage]);

  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE) || 1;

  const handleSearch = () => { setAppliedFilter(searchInput.trim()); setCurrentPage(1); };

  const handleOpenAdd = () => { setEditingRow(null); setFormValue(""); setShowModal(true); };
  const handleOpenEdit = (row) => { setEditingRow(row); setFormValue(row.flowType || row.FlowType || ""); setShowModal(true); };

  const handleSave = async () => {
    if (!formValue.trim()) { alert("Flow Type is required"); return; }
    try {
      editingRow
        ? await updateTypeFlux(editingRow.idTypeFlux, { flowType: formValue })
        : await addTypeFlux({ flowType: formValue });
      setShowModal(false);
      setFormValue("");
      setEditingRow(null);
      await fetchData();
    } catch { alert("Operation failed"); }
  };

  const handleDelete = async (row) => {
    const val = row.flowType || row.FlowType || "";
    if (!window.confirm(`Delete type flux "${val}"?`)) return;
    try { await deleteTypeFlux(row.idTypeFlux); await fetchData(); }
    catch { alert("Delete failed"); }
  };

  return (
    <div className="filein-page-bootstrap">

      <div className="filein-card">
        <div className="filein-card-title">
          <span>Technical Management : <span className="accent">Type Flux</span></span>
        </div>
        <div className="filein-card-body">
          <div className="filein-page-header">
            <div>
              <h4>Type Flux Management</h4>
              <p>Add, update, and maintain flow type reference data.</p>
            </div>
            <button className="filein-btn-search" onClick={handleOpenAdd}>+ Add Type Flux</button>
          </div>
        </div>
      </div>

      <div className="filein-card">
        <div className="filein-card-title">
          <span>Search Result : <span className="accent">Type Flux</span></span>
          <span className="filein-results-badge">{filteredRows.length.toLocaleString()} results</span>
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
            <button className="filein-btn-search" onClick={handleSearch}>Search</button>
          </div>
        </div>

        <div className="filein-table-wrap">
          <table className="filein-table" style={{ tableLayout: "auto" }}>
            <thead>
              <tr>
                <th style={{ width: "140px" }}>ID Type Flux</th>
                <th>Flow Type</th>
                <th style={{ width: "200px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr><td colSpan={3} className="filein-table-empty">No type flux found.</td></tr>
              ) : paginatedRows.map((row) => (
                <tr key={row.idTypeFlux}>
                  <td className="mono">{row.idTypeFlux}</td>
                  <td title={row.flowType || row.FlowType}>{row.flowType || row.FlowType}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="filein-btn-edit" onClick={() => handleOpenEdit(row)}>Edit</button>
                      <button className="filein-btn-force" onClick={() => handleDelete(row)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="filein-action-bar">
          <div className="filein-pagination">
            <button className="filein-btn-page" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>← Prev</button>
            <span>Page {currentPage} / {totalPages}</span>
            <button className="filein-btn-page" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next →</button>
          </div>
        </div>
      </div>

      <CrudModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingRow ? "Edit Type Flux" : "Add Type Flux"}
        label="Flow Type"
        value={formValue}
        onChange={setFormValue}
        placeholder="Enter flow type"
        onSave={handleSave}
      />
    </div>
  );
}