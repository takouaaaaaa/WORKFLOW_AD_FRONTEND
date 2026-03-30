import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFileOuts } from "../services/api";
import "./FileSearchPage.css";

const STATUTS = [
  "ALL","NACKED","BLOCKED","ARCHIVED","INERROR","INITIAL","WAITTOBESENT",
  "ERRORREPORTEDTOSENDER","ACKED","SENTANDWAITINGACK","SENT",
  "INITIATED","CANCELLED","PUTINQUEUEOUTFAILED"
];

export default function FileOutPage() {
  const navigate = useNavigate();
  const [rows, setRows]         = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const [filters, setFilters] = useState({
    appReference: "",
    statut: "ALL",
    usedAddress: "",
  });

  useEffect(() => {
    getFileOuts()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.content || [];
        setRows(data);
        setFiltered(data);
      })
      .catch(() => setError("Failed to load File OUT data"))
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = () => {
    let result = [...rows];
    if (filters.appReference)
      result = result.filter((r) => r.flux?.appReference?.toLowerCase().includes(filters.appReference.toLowerCase()));
    if (filters.statut !== "ALL")
      result = result.filter((r) => r.statutFluxOUT === filters.statut);
    if (filters.usedAddress)
      result = result.filter((r) => r.usedAddress?.toLowerCase().includes(filters.usedAddress.toLowerCase()));
    setFiltered(result);
  };

  const handleReset = () => {
    setFilters({ appReference: "", statut: "ALL", usedAddress: "" });
    setFiltered(rows);
  };

  const statusClass = (s) => {
    if (!s) return "";
    if (["SENT","ACKED","ARCHIVED"].includes(s)) return "badge-ok";
    if (["NACKED","BLOCKED","INERROR","ERRORREPORTEDTOSENDER","PUTINQUEUEOUTFAILED","CANCELLED"].includes(s)) return "badge-err";
    if (["WAITTOBESENT","SENTANDWAITINGACK","INITIAL","INITIATED"].includes(s)) return "badge-warn";
    return "badge-info";
  };

  return (
    <div className="fspage-body">
      <div className="fspage-topbar">
        <div className="fspage-logo">⬡ CURE</div>
        <div className="fspage-topbar-right">
          <button className="fspage-back-btn" onClick={() => navigate("/dashboard")}>← Back</button>
        </div>
      </div>

      <div className="fspage-content">
        <div className="fspage-title-row">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="12" x2="12" y2="18" />
            <polyline points="9 15 12 12 15 15" />
          </svg>
          <span className="fspage-title">File OUT · Search</span>
        </div>

        <div className="fspage-card">
          <div className="fspage-filters">
            <div className="fspage-field">
              <label className="fspage-label">App Reference</label>
              <input className="fspage-input" placeholder="Search..." value={filters.appReference}
                onChange={(e) => setFilters({ ...filters, appReference: e.target.value })} />
            </div>
            <div className="fspage-field">
              <label className="fspage-label">Used Address</label>
              <input className="fspage-input" placeholder="Search..." value={filters.usedAddress}
                onChange={(e) => setFilters({ ...filters, usedAddress: e.target.value })} />
            </div>
            <div className="fspage-field">
              <label className="fspage-label">Status</label>
              <select className="fspage-select" value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}>
                {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="fspage-actions">
            <button className="fspage-btn-reset" onClick={handleReset}>Reset</button>
            <button className="fspage-btn-search" onClick={handleFilter}>Search</button>
          </div>
        </div>

        <div className="fspage-card">
          <div className="fspage-card-title">Results — {filtered.length} record(s)</div>
          {error && <div className="fspage-error">{error}</div>}
          {loading ? (
            <div className="fspage-muted">Loading...</div>
          ) : (
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
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="fspage-empty">No records found</td></tr>
                  ) : filtered.map((r) => (
                    <tr key={r.idFluxOut}>
                      <td>{r.idFluxOut}</td>
                      <td className="fspage-mono">{r.flux?.appReference || "—"}</td>
                      <td><span className={`fspage-badge ${statusClass(r.statutFluxOUT)}`}>{r.statutFluxOUT}</span></td>
                      <td>{r.usedAddress || "—"}</td>
                      <td>{r.creationDate ? new Date(r.creationDate).toLocaleString() : "—"}</td>
                      <td>{r.updateDate ? new Date(r.updateDate).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}