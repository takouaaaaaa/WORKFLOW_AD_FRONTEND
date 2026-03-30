import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFileIns, getFluxes, forceFileIn, rejectFileIn } from "../services/api";
import "./FileInPage.css";

const STATUTS = [
  "ALL",
  "INITIATED",
  "BLOCKED",
  "WAITACTION",
  "CANCELED",
  "SUSPENDED",
  "PUTINQUEUEFAILED",
  "INIT",
  "PROCESSED",
  "INTECHNICALERROR",
  "NOCONTRACTFOUND",
  "REJECTED",
  "ARCHIVED",
  "INPROCESS",
  "INBUSINESSERROR",
];

const CATEGORIES = ["ALL", "ACQUISITION", "RESTITUTION"];

const FLUX_ITEMS_PER_PAGE = 5;
const FILEIN_ITEMS_PER_PAGE = 5;

export default function FileInPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loadingFileIn, setLoadingFileIn] = useState(true);
  const [errorFileIn, setErrorFileIn] = useState("");

  const [fluxRows, setFluxRows] = useState([]);
  const [loadingFlux, setLoadingFlux] = useState(true);
  const [errorFlux, setErrorFlux] = useState("");

  const [filters, setFilters] = useState({
    senderReference: "",
    statut: "ALL",
    category: "ALL",
    appReference: "",
  });

  const [fluxPage, setFluxPage] = useState(1);
  const [fileInPage, setFileInPage] = useState(1);

  const fetchFileIns = () => {
    setLoadingFileIn(true);
    setErrorFileIn("");

    getFileIns()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.content || [];
        setRows(data);
        setFiltered(data);
        setFileInPage(1);
      })
      .catch(() => setErrorFileIn("Failed to load File IN data"))
      .finally(() => setLoadingFileIn(false));
  };

  const fetchFluxes = () => {
    setLoadingFlux(true);
    setErrorFlux("");

    getFluxes()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.content || [];
        setFluxRows(data);
        setFluxPage(1);
      })
      .catch(() => setErrorFlux("Failed to load Flux data"))
      .finally(() => setLoadingFlux(false));
  };

  useEffect(() => {
    fetchFileIns();
    fetchFluxes();
  }, []);

  const handleFilter = () => {
    let result = [...rows];

    if (filters.senderReference) {
      result = result.filter((r) =>
        r.senderReference?.toLowerCase().includes(filters.senderReference.toLowerCase())
      );
    }

    if (filters.statut !== "ALL") {
      result = result.filter((r) => r.statutFluxIn === filters.statut);
    }

    if (filters.category !== "ALL") {
      result = result.filter((r) => r.category === filters.category);
    }

    if (filters.appReference) {
      result = result.filter((r) =>
        r.flux?.appReference?.toLowerCase().includes(filters.appReference.toLowerCase())
      );
    }

    setFiltered(result);
    setFileInPage(1);
  };

  const handleReset = () => {
    setFilters({
      senderReference: "",
      statut: "ALL",
      category: "ALL",
      appReference: "",
    });
    setFiltered(rows);
    setFileInPage(1);
  };

  const handleForce = async (id) => {
    try {
      await forceFileIn(id);
      fetchFileIns();
    } catch {
      alert("Failed to force");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectFileIn(id);
      fetchFileIns();
    } catch {
      alert("Failed to reject");
    }
  };

  const statusClass = (s) => {
    if (!s) return "";
    if (["PROCESSED", "ARCHIVED"].includes(s)) return "badge-ok";
    if (
      [
        "BLOCKED",
        "REJECTED",
        "INTECHNICALERROR",
        "INBUSINESSERROR",
        "CANCELED",
        "PUTINQUEUEFAILED",
      ].includes(s)
    ) {
      return "badge-err";
    }
    if (["WAITACTION", "SUSPENDED", "NOCONTRACTFOUND"].includes(s)) return "badge-warn";
    return "badge-info";
  };

  const fluxTotalPages = Math.ceil(fluxRows.length / FLUX_ITEMS_PER_PAGE) || 1;
  const fileInTotalPages = Math.ceil(filtered.length / FILEIN_ITEMS_PER_PAGE) || 1;

  const paginatedFluxRows = useMemo(() => {
    const start = (fluxPage - 1) * FLUX_ITEMS_PER_PAGE;
    return fluxRows.slice(start, start + FLUX_ITEMS_PER_PAGE);
  }, [fluxRows, fluxPage]);

  const paginatedFileInRows = useMemo(() => {
    const start = (fileInPage - 1) * FILEIN_ITEMS_PER_PAGE;
    return filtered.slice(start, start + FILEIN_ITEMS_PER_PAGE);
  }, [filtered, fileInPage]);

  return (
    <div className="fspage-body">
      <div className="fspage-topbar">
        <div className="fspage-logo">⬡ CURE</div>
        <div className="fspage-topbar-right">
          <button className="fspage-back-btn" onClick={() => navigate("/dashboard")}>
            ← Back
          </button>
        </div>
      </div>

      <div className="fspage-content">
        {/* FLUX TABLE */}
        <div className="fspage-title-row">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
          <span className="fspage-title">Flux</span>
        </div>

        <div className="fspage-card">
          <div className="fspage-card-title">Flux — {fluxRows.length} record(s)</div>

          {errorFlux && <div className="fspage-error">{errorFlux}</div>}

          {loadingFlux ? (
            <div className="fspage-muted">Loading...</div>
          ) : (
            <>
              <div className="fspage-table-wrapper">
                <table className="fspage-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>App Reference</th>
                      <th>Total Amount</th>
                      <th>Flow Type</th>
                      <th>Sender</th>
                      <th>Receiver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFluxRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="fspage-empty">
                          No records found
                        </td>
                      </tr>
                    ) : (
                      paginatedFluxRows.map((f) => (
                        <tr key={f.idFlux}>
                          <td>{f.idFlux}</td>
                          <td className="fspage-mono">{f.appReference || "—"}</td>
                          <td>{f.totalAmount != null ? f.totalAmount.toLocaleString() : "—"}</td>
                          <td>{f.typeFlux?.flowType || f.typeFlux?.FlowType || "—"}</td>
                          <td>{f.sender?.sender || "—"}</td>
                          <td>{f.receiver?.receiver || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="fspage-pagination">
                <button
                  className="fspage-page-btn"
                  disabled={fluxPage === 1}
                  onClick={() => setFluxPage((prev) => prev - 1)}
                >
                  Previous
                </button>

                <span className="fspage-page-info">
                  Page {fluxPage} / {fluxTotalPages}
                </span>

                <button
                  className="fspage-page-btn"
                  disabled={fluxPage === fluxTotalPages}
                  onClick={() => setFluxPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {/* FILE IN FILTERS */}
        <div className="fspage-title-row fspage-section-space">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="12" x2="12" y2="18" />
            <polyline points="9 15 12 18 15 15" />
          </svg>
          <span className="fspage-title">File IN · Search</span>
        </div>

        <div className="fspage-card">
          <div className="fspage-filters">
            <div className="fspage-field">
              <label className="fspage-label">Sender Reference</label>
              <input
                className="fspage-input"
                placeholder="Search..."
                value={filters.senderReference}
                onChange={(e) =>
                  setFilters({ ...filters, senderReference: e.target.value })
                }
              />
            </div>

            <div className="fspage-field">
              <label className="fspage-label">App Reference</label>
              <input
                className="fspage-input"
                placeholder="Search..."
                value={filters.appReference}
                onChange={(e) =>
                  setFilters({ ...filters, appReference: e.target.value })
                }
              />
            </div>

            <div className="fspage-field">
              <label className="fspage-label">Status</label>
              <select
                className="fspage-select"
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              >
                {STATUTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="fspage-field">
              <label className="fspage-label">Category</label>
              <select
                className="fspage-select"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="fspage-actions">
            <button className="fspage-btn-reset" onClick={handleReset}>
              Reset
            </button>
            <button className="fspage-btn-search" onClick={handleFilter}>
              Search
            </button>
          </div>
        </div>

        {/* FILE IN RESULTS */}
        <div className="fspage-card">
          <div className="fspage-card-title">Results — {filtered.length} record(s)</div>

          {errorFileIn && <div className="fspage-error">{errorFileIn}</div>}

          {loadingFileIn ? (
            <div className="fspage-muted">Loading...</div>
          ) : (
            <>
              <div className="fspage-table-wrapper">
                <table className="fspage-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>App Reference</th>
                      <th>Sender Reference</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Sending Date</th>
                      <th>Settlement Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFileInRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="fspage-empty">
                          No records found
                        </td>
                      </tr>
                    ) : (
                      paginatedFileInRows.map((r) => (
                        <tr key={r.idFluxIn}>
                          <td>{r.idFluxIn}</td>
                          <td className="fspage-mono">{r.flux?.appReference || "—"}</td>
                          <td>{r.senderReference || "—"}</td>
                          <td>
                            <span className={`fspage-badge ${statusClass(r.statutFluxIn)}`}>
                              {r.statutFluxIn}
                            </span>
                          </td>
                          <td>{r.category || "—"}</td>
                          <td>
                            {r.sendingDate
                              ? new Date(r.sendingDate).toLocaleString()
                              : "—"}
                          </td>
                          <td>
                            {r.settlementDate
                              ? new Date(r.settlementDate).toLocaleString()
                              : "—"}
                          </td>
                          <td>
                            <div className="fspage-action-btns">
                              <button
                                className="fspage-btn-force"
                                onClick={() => handleForce(r.idFluxIn)}
                              >
                                Force
                              </button>
                              <button
                                className="fspage-btn-reject"
                                onClick={() => handleReject(r.idFluxIn)}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="fspage-pagination">
                <button
                  className="fspage-page-btn"
                  disabled={fileInPage === 1}
                  onClick={() => setFileInPage((prev) => prev - 1)}
                >
                  Previous
                </button>

                <span className="fspage-page-info">
                  Page {fileInPage} / {fileInTotalPages}
                </span>

                <button
                  className="fspage-page-btn"
                  disabled={fileInPage === fileInTotalPages}
                  onClick={() => setFileInPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}