import { useEffect, useMemo, useState } from "react";
import {
  getTypeFluxes,
  addTypeFlux,
  updateTypeFlux,
  deleteTypeFlux,
} from "../services/typeFluxService";
import "../../fonctionnel/styles/FileInPage.css";

const ITEMS_PER_PAGE = 10;

export default function TypeFluxPage() {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchFlowTypeInput, setSearchFlowTypeInput] = useState("");
  const [appliedFlowTypeFilter, setAppliedFlowTypeFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formData, setFormData] = useState({ flowType: "" });

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

  const filteredRows = useMemo(() => {
    const flowTypeFilter = appliedFlowTypeFilter.trim().toLowerCase();

    return rows.filter((row) => {
      const rowFlowType = String(row.flowType || row.FlowType || "").toLowerCase();
      return !flowTypeFilter || rowFlowType.includes(flowTypeFilter);
    });
  }, [rows, appliedFlowTypeFilter]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRows, currentPage]);

  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE) || 1;

  const handleSearch = () => {
    const cleanFlowType = searchFlowTypeInput.trim();

    if (!cleanFlowType) {
      setAppliedFlowTypeFilter("");
      setSearchFlowTypeInput("");
      setCurrentPage(1);
      return;
    }

    setAppliedFlowTypeFilter(cleanFlowType);
    setCurrentPage(1);
  };

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
        alert("Type Flux updated successfully");
      } else {
        await addTypeFlux(payload);
        alert("Type Flux added successfully");
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
      alert("Type Flux deleted successfully");
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
            <span style={{ color: "#a371f7" }}>Type Flux</span>
          </span>
        </div>

        <div className="filein-card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h4 style={{ color: "#e6edf3", marginBottom: "6px" }}>
                Type Flux Management
              </h4>
              <p style={{ color: "#8b949e", margin: 0, fontSize: "13px" }}>
                Add, update, and maintain flow type reference data.
              </p>
            </div>

            <button className="btn filein-btn-search" onClick={handleOpenAdd}>
              + Add Type Flux
            </button>
          </div>
        </div>
      </div>

      <div className="filein-card">
        <div className="filein-card-title">
          <span>
            Search Result : <span style={{ color: "#a371f7" }}>Type Flux</span>
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
            {filteredRows.length.toLocaleString()} results
          </span>
        </div>

        <div className="filein-card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-6">
              <label className="form-label filein-label">Flow Type</label>
              <input
                type="text"
                value={searchFlowTypeInput}
                onChange={(e) => setSearchFlowTypeInput(e.target.value)}
                placeholder="Search by flow type"
                className="form-control filein-input"
              />
            </div>

            <div className="col-12 col-md-auto">
              <button
                className="btn filein-btn-search"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="filein-table-wrap">
          <table className="table filein-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: "160px" }}>ID Type Flux</th>
                <th>Flow Type</th>
                <th style={{ width: "220px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "40px" }}>
                    No type flux found
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
                {editingRow ? "Edit Type Flux" : "Add Type Flux"}
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
              <label className="filein-label mb-2">Flow Type</label>
              <input
                type="text"
                value={formData.flowType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, flowType: e.target.value }))
                }
                placeholder="Enter flow type"
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