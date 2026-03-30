import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFluxes, getFileOuts } from "../services/api";
import "./FluxOutPage.css";

const STATUTS = [
  "ALL",
  "NACKED",
  "BLOCKED",
  "ARCHIVED",
  "INERROR",
  "INITIAL",
  "WAITTOBESENT",
  "ERRORREPORTEDTOSENDER",
  "ACKED",
  "SENTANDWAITINGACK",
  "SENT",
  "INITIATED",
  "CANCELLED",
  "PUTINQUEUEOUTFAILED",
];

const FLUX_ITEMS_PER_PAGE = 5;
const FILEOUT_ITEMS_PER_PAGE = 5;

export default function FluxOutPage() {
  const navigate = useNavigate();

  const [fluxRows, setFluxRows] = useState([]);
  const [loadingFlux, setLoadingFlux] = useState(true);
  const [errorFlux, setErrorFlux] = useState("");

  const [rows, setRows] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loadingFileOut, setLoadingFileOut] = useState(true);
  const [errorFileOut, setErrorFileOut] = useState("");

  const [filters, setFilters] = useState({
    appReference: "",
    statut: "ALL",
    usedAddress: "",
  });

  const [fluxPage, setFluxPage] = useState(1);
  const [fileOutPage, setFileOutPage] = useState(1);

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

  const fetchFileOuts = () => {
    setLoadingFileOut(true);
    setErrorFileOut("");

    getFileOuts()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.content || [];
        setRows(data);
        setFiltered(data);
        setFileOutPage(1);
      })
      .catch(() => setErrorFileOut("Failed to load File OUT data"))
      .finally(() => setLoadingFileOut(false));
  };

  useEffect(() => {
    fetchFluxes();
    fetchFileOuts();
  }, []);

  const handleFilter = () => {
    let result = [...rows];

    if (filters.appReference) {
      result = result.filter((r) =>
        r.flux?.appReference?.toLowerCase().includes(filters.appReference.toLowerCase())
      );
    }

    if (filters.statut !== "ALL") {
      result = result.filter((r) => r.statutFluxOUT === filters.statut);
    }

    if (filters.usedAddress) {
      result = result.filter((r) =>
        r.usedAddress?.toLowerCase().includes(filters.usedAddress.toLowerCase())
      );
    }

    setFiltered(result);
    setFileOutPage(1);
  };

  const handleReset = () => {
    setFilters({
      appReference: "",
      statut: "ALL",
      usedAddress: "",
    });
    setFiltered(rows);
    setFileOutPage(1);
  };

  const statusClass = (s) => {
    if (!s) return "";
    if (["SENT", "ACKED", "ARCHIVED"].includes(s)) return "badge-ok";
    if (
      [
        "NACKED",
        "BLOCKED",
        "INERROR",
        "ERRORREPORTEDTOSENDER",
        "PUTINQUEUEOUTFAILED",
        "CANCELLED",
      ].includes(s)
    )
      return "badge-err";
    if (["WAITTOBESENT", "SENTANDWAITINGACK", "INITIAL", "INITIATED"].includes(s))
      return "badge-warn";
    return "badge-info";
  };

  const fluxTotalPages = Math.ceil(fluxRows.length / FLUX_ITEMS_PER_PAGE) || 1;
  const fileOutTotalPages = Math.ceil(filtered.length / FILEOUT_ITEMS_PER_PAGE) || 1;

  const paginatedFluxRows = useMemo(() => {
    const start = (fluxPage - 1) * FLUX_ITEMS_PER_PAGE;
    return fluxRows.slice(start, start + FLUX_ITEMS_PER_PAGE);
  }, [fluxRows, fluxPage]);

  const paginatedFileOutRows = useMemo(() => {
    const start = (fileOutPage - 1) * FILEOUT_ITEMS_PER_PAGE;
    return filtered.slice(start, start + FILEOUT_ITEMS_PER_PAGE);
  }, [filtered, fileOutPage]);

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
        {/* FLUX */}
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

        {/* FILE OUT SEARCH */}
        <div className="fspage-title-row fspage-section-space">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="12" x2="12" y2="18" />
            <polyline points="9 15 12 12 15 15" />
          </svg>
          <span className="fspage-title">File OUT · Search</span>
        </div>

        <div className="fspage-card">
          <div className="fspage-filters fspage-filters-3">
            <div className="fspage-field">
              <label className="fspage-label">App Reference</label>
              <input
                className="fspage-input"
                placeholder="Search..."
                value={filters.appReference}
                onChange={(e) => setFilters({ ...filters, appReference: e.target.value })}
              />
            </div>

            <div className="fspage-field">
              <label className="fspage-label">Used Address</label>
              <input
                className="fspage-input"
                placeholder="Search..."
                value={filters.usedAddress}
                onChange={(e) => setFilters({ ...filters, usedAddress: e.target.value })}
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

        {/* FILE OUT RESULTS */}
        <div className="fspage-card">
          <div className="fspage-card-title">Results — {filtered.length} record(s)</div>

          {errorFileOut && <div className="fspage-error">{errorFileOut}</div>}

          {loadingFileOut ? (
            <div className="fspage-muted">Loading...</div>
          ) : (
            <>
              <div className="fspage-table-wrapper">
                <table className="fspage-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>App Reference</th>
                      <th>Status</th>
                      <th>Used Address</th>
                      <th>Creation Date</th>
                      <th>Update Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFileOutRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="fspage-empty">
                          No records found
                        </td>
                      </tr>
                    ) : (
                      paginatedFileOutRows.map((r) => (
                        <tr key={r.idFluxOut}>
                          <td>{r.idFluxOut}</td>
                          <td className="fspage-mono">{r.flux?.appReference || "—"}</td>
                          <td>
                            <span className={`fspage-badge ${statusClass(r.statutFluxOUT)}`}>
                              {r.statutFluxOUT}
                            </span>
                          </td>
                          <td>{r.usedAddress || "—"}</td>
                          <td>
                            {r.creationDate ? new Date(r.creationDate).toLocaleString() : "—"}
                          </td>
                          <td>
                            {r.updateDate ? new Date(r.updateDate).toLocaleString() : "—"}
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
                  disabled={fileOutPage === 1}
                  onClick={() => setFileOutPage((prev) => prev - 1)}
                >
                  Previous
                </button>

                <span className="fspage-page-info">
                  Page {fileOutPage} / {fileOutTotalPages}
                </span>

                <button
                  className="fspage-page-btn"
                  disabled={fileOutPage === fileOutTotalPages}
                  onClick={() => setFileOutPage((prev) => prev + 1)}
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