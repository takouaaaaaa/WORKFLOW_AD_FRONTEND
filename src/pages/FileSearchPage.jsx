import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/api";
import "./Dashboard.css";

// FileSearchPage is used for both File IN and File OUT.
// The route param ":type" will be either "file-in" or "file-out".
// Example routes:
//   /dashboard/file-in
//   /dashboard/file-out

export default function FileSearchPage() {
  const { type } = useParams();           // "file-in" | "file-out"
  const navigate  = useNavigate();

  const isIn       = type === "file-in";
  const title      = isIn ? "File IN" : "File OUT";
  const accentColor = isIn ? "var(--accent)" : "var(--accent2)";

  // ── Form state ────────────────────────────────────────────────
  const EMPTY_FORM = {
    appReference: "",
    status: "0",
    flowType: "0",
    route: "0",
    sender: "",
    senderRef: "",
    routeRef: "",
    transferFileName: "",
    message: "",
    rawMessage: "",
    dateFrom: "",
    dateTo: "",
    category: "",
    elementsFrom: "",
    elementsTo: "",
    totalFrom: "",
    totalTo: "",
    workflowId: "",
    settlementDate: "",
  };

  const [form,     setForm]     = useState(EMPTY_FORM);
  const [results,  setResults]  = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Replace URL with your real endpoint
      const res = await axiosInstance.get(`/${type}`, { params: form });
      setResults(res.data);
    } catch {
      setError("Search failed. Please check your criteria and try again.");
      setResults([]);
    } finally {
      setSearched(true);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setResults([]);
    setSearched(false);
    setError("");
  };

  return (
    <div className="palm-body">

      {/* ── Topbar (minimal, with back button) ── */}
      <div className="palm-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="fsearch-back-btn" onClick={() => navigate("/dashboard")}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Dashboard
          </button>
          <div className="palm-logo">⬡ PALMYRA</div>
        </div>
        <div className="palm-topbar-right">
          <span style={{ color: accentColor, fontFamily: "Orbitron, monospace", fontSize: 13, letterSpacing: 1 }}>
            {title}
          </span>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="palm-main" style={{ maxWidth: "100%", padding: "24px 32px" }}>

        {/* Page header */}
        <div className="fsearch-header">
          <div className="fsearch-title-row">
            <span className="fsearch-icon" style={{ color: accentColor }}>
              {isIn ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="12" x2="12" y2="18" />
                  <polyline points="9 15 12 18 15 15" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <polyline points="9 15 12 12 15 15" />
                </svg>
              )}
            </span>
            <h2 className="fsearch-title">
              Search Criteria : <span style={{ color: accentColor }}>{title}</span>
            </h2>
          </div>
        </div>

        {/* Search form card */}
        <div className="fsearch-card">

          {/* Row 1 */}
          <div className="fsearch-grid-4">
            <div className="fsearch-field">
              <label className="fsearch-label">App Reference</label>
              <input className="fsearch-input" name="appReference" value={form.appReference} onChange={handleChange} placeholder="--" />
            </div>
            <div className="fsearch-field">
              <label className="fsearch-label">Status</label>
              <select className="fsearch-select" name="status" value={form.status} onChange={handleChange}>
                <option value="0">--</option>
                <option value="processed">Processed</option>
                <option value="pending">Pending</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div className="fsearch-field">
              <label className="fsearch-label">Flow Type</label>
              <select className="fsearch-select" name="flowType" value={form.flowType} onChange={handleChange}>
                <option value="0">--</option>
                <option value="ref-atena">ref-atena</option>
                <option value="ref-contrat-restitution">ref-contrat-restitution</option>
                <option value="ref-sible">ref-sible</option>
              </select>
            </div>
            <div className="fsearch-field">
              <label className="fsearch-label">Route</label>
              <select className="fsearch-select" name="route" value={form.route} onChange={handleChange}>
                <option value="0">--</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="fsearch-grid-4">
            <div className="fsearch-field">
              <label className="fsearch-label">Sender</label>
              <input className="fsearch-input" name="sender" value={form.sender} onChange={handleChange} placeholder="--" />
            </div>
            <div className="fsearch-field">
              <label className="fsearch-label">Sender Reference</label>
              <input className="fsearch-input" name="senderRef" value={form.senderRef} onChange={handleChange} placeholder="--" />
            </div>
            <div className="fsearch-field">
              <label className="fsearch-label">Route Reference</label>
              <input className="fsearch-input" name="routeRef" value={form.routeRef} onChange={handleChange} placeholder="--" />
            </div>
            <div className="fsearch-field">
              <label className="fsearch-label">Transfer File Name</label>
              <input className="fsearch-input" name="transferFileName" value={form.transferFileName} onChange={handleChange} placeholder="--" />
            </div>
          </div>

          {/* Collapsible section */}
          <div className="fsearch-collapse-bar">
            <span>Nom des fichiers reçus</span>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </div>
          <div className="fsearch-grid-2" style={{ paddingTop: 8 }}>
            <div className="fsearch-field">
              <label className="fsearch-label">Message</label>
              <input className="fsearch-input" name="message" value={form.message} onChange={handleChange} placeholder="--" />
            </div>
            <div className="fsearch-field">
              <label className="fsearch-label">Raw Message</label>
              <input className="fsearch-input" name="rawMessage" value={form.rawMessage} onChange={handleChange} placeholder="--" />
            </div>
          </div>

          {/* Dates */}
          <div className="fsearch-grid-2">
            <div className="fsearch-field">
              <label className="fsearch-label">Sending Date — from</label>
              <input className="fsearch-input" type="datetime-local" name="dateFrom" value={form.dateFrom} onChange={handleChange} />
            </div>
            <div className="fsearch-field">
              <label className="fsearch-label">Sending Date — to</label>
              <input className="fsearch-input" type="datetime-local" name="dateTo" value={form.dateTo} onChange={handleChange} />
            </div>
          </div>

          {/* Counts / amounts */}
          <div className="fsearch-grid-4">
            <div className="fsearch-field">
              <label className="fsearch-label">Elements Count — from</label>
              <input className="fsearch-input" name="elementsFrom" value={form.elementsFrom} onChange={handleChange} />
            </div>
            <div className="fsearch-field">
              <label className="fsearch-label">Elements Count — to</label>
              <input className="fsearch-input" name="elementsTo" value={form.elementsTo} onChange={handleChange} />
            </div>
            <div className="fsearch-field">
              <label className="fsearch-label">Category</label>
              <select className="fsearch-select" name="category" value={form.category} onChange={handleChange}>
                <option value="">--</option>
              </select>
            </div>
            <div className="fsearch-field" />
          </div>

          <div className="fsearch-grid-4">
            <div className="fsearch-field">
              <label className="fsearch-label">Total Amount — from</label>
              <input className="fsearch-input" name="totalFrom" value={form.totalFrom} onChange={handleChange} />
            </div>
            <div className="fsearch-field">
              <label className="fsearch-label">Total Amount — to</label>
              <input className="fsearch-input" name="totalTo" value={form.totalTo} onChange={handleChange} />
            </div>
            <div className="fsearch-field">
              <label className="fsearch-label">Workflow Id</label>
              <input className="fsearch-input" name="workflowId" value={form.workflowId} onChange={handleChange} placeholder="--" />
            </div>
            <div className="fsearch-field">
              <label className="fsearch-label">Settlement Date</label>
              <input className="fsearch-input" type="date" name="settlementDate" value={form.settlementDate} onChange={handleChange} />
            </div>
          </div>

          {/* Actions */}
          <div className="fsearch-actions">
            <button className="fsearch-btn-reset" onClick={handleReset}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.29" />
              </svg>
              Reinitialize
            </button>
            <button className="fsearch-btn-search" style={{ background: accentColor }} onClick={handleSearch} disabled={loading}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Bottom: Latest + Stored searches */}
        <div className="fsearch-bottom-grid">
          <div className="fsearch-card">
            <div className="palm-card-title">Latest Searches</div>
            <table className="palm-table">
              <thead>
                <tr><th>Date</th><th>Criteria</th><th></th></tr>
              </thead>
              <tbody>
                {[
                  { date: "02/03/2026 14:11:06.367", criteria: "0|SIB... ✦jira99... ⊙ 02/03/2026 11:00 → 23:59..." },
                  { date: "02/03/2026 14:10:59.998", criteria: "0|SIB... ✦jira989... ⊙ 02/03/2026 11:00 → 23:5..." },
                  { date: "02/03/2026 14:10:35.880", criteria: "0|SIB... ✦jira988... ⊙ 02/03/2026 11:00 → 23:5..." },
                ].map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>{r.date}</td>
                    <td style={{ fontSize: 11 }}>{r.criteria}</td>
                    <td>
                      <svg width="13" height="13" fill="none" stroke="var(--accent)" strokeWidth="2" viewBox="0 0 24 24" style={{ cursor: "pointer" }}>
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="fsearch-card">
            <div className="palm-card-title">Stored Searches</div>
            <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
              You have no stored search.<br />
              To start customizing, launch a search and use the "Favourite" button to start your first search.
            </p>
          </div>
        </div>

        {/* Results */}
        {error && <div className="palm-error">{error}</div>}

        {searched && !error && (
          <div className="fsearch-card">
            <div className="palm-card-title">Results</div>
            {results.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)" }}>No results found for the given criteria.</p>
            ) : (
              <table className="palm-table">
                <thead>
                  <tr>
                    <th>App Reference</th>
                    <th>Flow Type</th>
                    <th>Status</th>
                    <th>Sender</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td className="palm-mono">{r.ref}</td>
                      <td>{r.type}</td>
                      <td><span className="palm-badge ok">Processed</span></td>
                      <td>{r.sender}</td>
                      <td style={{ fontSize: 11, color: "var(--muted)" }}>{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}