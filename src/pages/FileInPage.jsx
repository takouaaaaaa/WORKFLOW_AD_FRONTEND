import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFileIns, forceFileIn, rejectFileIn } from "../services/api";
import "./FileSearchPage.css";

const STATUTS = [
  "ALL","INITIATED","BLOCKED","WAITACTION","CANCELED","SUSPENDED",
  "PUTINQUEUEFAILED","INIT","PROCESSED","INTECHNICALERROR",
  "NOCONTRACTFOUND","REJECTED","ARCHIVED","INPROCESS","INBUSINESSERROR"
];

const CATEGORIES = ["ALL", "ACQUISITION", "RESTITUTION"];

export default function FileInPage() {
  const navigate = useNavigate();
  const [rows, setRows]         = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const [filters, setFilters] = useState({
    senderReference: "",
    statut: "ALL",
    category: "ALL",
    appReference: "",
  });

  useEffect(() => {
    getFileIns()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.content || [];
        setRows(data);
        setFiltered(data);
      })
      .catch(() => setError("Failed to load File IN data"))
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = () => {
    let result = [...rows];
    if (filters.senderReference)
      result = result.filter((r) => r.senderReference?.toLowerCase().includes(filters.senderReference.toLowerCase()));
    if (filters.statut !== "ALL")
      result = result.filter((r) => r.statutFluxIn === filters.statut);
    if (filters.category !== "ALL")
      result = result.filter((r) => r.category === filters.category);
    if (filters.appReference)
      result = result.filter((r) => r.flux?.appReference?.toLowerCase().includes(filters.appReference.toLowerCase()));
    setFiltered(result);
  };

  const handleReset = () => {
    setFilters({ senderReference: "", statut: "ALL", category: "ALL", appReference: "" });
    setFiltered(rows);
  };

  const handleForce = async (id) => {
    try {
      await forceFileIn(id);
      const res = await getFileIns();
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setRows(data);
      setFiltered(data);
    } catch { alert("Failed to force"); }
  };

  const handleReject = async (id) => {
    try {
      await rejectFileIn(id);
      const res = await getFileIns();
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setRows(data);
      setFiltered(data);
    } catch { alert("Failed to reject"); }
  };

  const statusClass = (s) => {
    if (!s) return "";
    if (["PROCESSED","ARCHIVED"].includes(s)) return "badge-ok";
    if (["BLOCKED","REJECTED","INTECHNICALERROR","INBUSINESSERROR","CANCELED","PUTINQUEUEFAILED"].includes(s)) return "badge-err";
    if (["WAITACTION","SUSPENDED","NOCONTRACTFOUND"].includes(s)) return "badge-warn";
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
            <polyline points="9 15 12 18 15 15" />
          </svg>
          <span className="fspage-title">File IN · Search</span>
        </div>

        <div className="fspage-card">
          <div className="fspage-filters">
            <div className="fspage-field">
              <label className="fspage-label">Sender Reference</label>
              <input className="fspage-input" placeholder="Search..." value={filters.senderReference}
                onChange={(e) => setFilters({ ...filters, senderReference: e.target.value })} />
            </div>
            <div className="fspage-field">
              <label className="fspage-label">App Reference</label>
              <input className="fspage-input" placeholder="Search..." value={filters.appReference}
                onChange={(e) => setFilters({ ...filters, appReference: e.target.value })} />
            </div>
            <div className="fspage-field">
              <label className="fspage-label">Status</label>
              <select className="fspage-select" value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}>
                {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="fspage-field">
              <label className="fspage-label">Category</label>
              <select className="fspage-select" value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
                    <th>Sender Reference</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Sending Date</th>
                    <th>Settlement Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="fspage-empty">No records found</td></tr>
                  ) : filtered.map((r) => (
                    <tr key={r.idFluxIn}>
                      <td>{r.idFluxIn}</td>
                      <td className="fspage-mono">{r.flux?.appReference || "—"}</td>
                      <td>{r.senderReference}</td>
                      <td><span className={`fspage-badge ${statusClass(r.statutFluxIn)}`}>{r.statutFluxIn}</span></td>
                      <td>{r.category}</td>
                      <td>{r.sendingDate ? new Date(r.sendingDate).toLocaleString() : "—"}</td>
                      <td>{r.settlementDate ? new Date(r.settlementDate).toLocaleString() : "—"}</td>
                      <td>
                        <div className="fspage-action-btns">
                          <button className="fspage-btn-force" onClick={() => handleForce(r.idFluxIn)}>Force</button>
                          <button className="fspage-btn-reject" onClick={() => handleReject(r.idFluxIn)}>Reject</button>
                        </div>
                      </td>
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