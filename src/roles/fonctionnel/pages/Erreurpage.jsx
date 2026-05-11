// ── Paste this as the FULL ErrorAnalysisCard component in FonctionnelDashboard.jsx ──

function ErrorAnalysisCard({ fluxData, loading }) {
  const navigate = useNavigate();

  const countByStatus = (statusKey) =>
    fluxData.filter((f) => (f?.status || "").toUpperCase() === statusKey).length;

  const totalErrors = ERROR_STATUSES.reduce((sum, s) => sum + countByStatus(s.key), 0);
  const totalWarn   = WARN_STATUSES.reduce((sum, s)  => sum + countByStatus(s.key), 0);
  const totalNormal = fluxData.length - totalErrors - totalWarn;
  const maxError    = Math.max(...ERROR_STATUSES.map((s) => countByStatus(s.key)), 1);
  const maxWarn     = Math.max(...WARN_STATUSES.map((s)  => countByStatus(s.key)), 1);

  return (
    <div className="palm-error-card">
      <div className="palm-card-title">Analyse des erreurs</div>
      <p className="palm-error-sub">
        Flux en anomalie par statut · Cliquez sur un statut pour voir les détails
      </p>

      <div className="palm-error-metrics">
        <div className="palm-error-metric">
          <span className="palm-error-metric-val danger">{loading ? "..." : totalErrors}</span>
          <span className="palm-error-metric-lbl">Erreurs critiques</span>
        </div>
        <div className="palm-error-metric">
          <span className="palm-error-metric-val warn">{loading ? "..." : totalWarn}</span>
          <span className="palm-error-metric-lbl">En attente</span>
        </div>
        <div className="palm-error-metric">
          <span className="palm-error-metric-val ok">{loading ? "..." : Math.max(0, totalNormal)}</span>
          <span className="palm-error-metric-lbl">Normaux</span>
        </div>
      </div>

      <div className="palm-error-section-label">Erreurs critiques → File IN</div>
      {ERROR_STATUSES.map(({ key, label }) => {
        const count = countByStatus(key);
        const pct   = totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0;
        const barW  = Math.round((count / maxError) * 100);
        if (count === 0) return null;
        return (
          <div
            key={key}
            className="palm-error-row"
            onClick={() => navigate("/fonctionnel/file-in", { state: { status: key } })}
          >
            <span className="palm-error-badge danger">{label}</span>
            <div className="palm-error-bar-bg">
              <div className="palm-error-bar-fill danger" style={{ width: `${barW}%` }} />
            </div>
            <span className="palm-error-count">{count}</span>
            <span className="palm-error-pct">{pct}%</span>
            <span className="palm-error-arrow">›</span>
          </div>
        );
      })}

      {totalErrors === 0 && !loading && (
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", padding: "8px 0" }}>
          Aucune erreur critique détectée.
        </p>
      )}

      <div className="palm-error-section-label" style={{ marginTop: 16 }}>En attente / bloqués → File OUT</div>
      {WARN_STATUSES.map(({ key, label }) => {
        const count = countByStatus(key);
        const pct   = totalWarn > 0 ? Math.round((count / totalWarn) * 100) : 0;
        const barW  = Math.round((count / maxWarn) * 100);
        if (count === 0) return null;
        return (
          <div
            key={key}
            className="palm-error-row"
            onClick={() => navigate("/fonctionnel/file-out", { state: { status: key } })}
          >
            <span className="palm-error-badge warn">{label}</span>
            <div className="palm-error-bar-bg">
              <div className="palm-error-bar-fill warn" style={{ width: `${barW}%` }} />
            </div>
            <span className="palm-error-count">{count}</span>
            <span className="palm-error-pct">{pct}%</span>
            <span className="palm-error-arrow">›</span>
          </div>
        );
      })}

      {totalWarn === 0 && !loading && (
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", padding: "8px 0" }}>
          Aucun flux en attente.
        </p>
      )}
    </div>
  );
}