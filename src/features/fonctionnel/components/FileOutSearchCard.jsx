export default function FileOutSearchCard({
  filters,
  onFilterChange,
  onSearch,
  onReset,
  statusOptions,
}) {
  return (
    <div className="filein-card mb-4">
      <div className="filein-card-title">
        Detailed Search : <span style={{ color: "#a371f7" }}>File OUT</span>
      </div>

      <div className="filein-card-body">
        <div className="row g-3">
          <div className="col-md-6 col-lg-4 col-xl-3">
            <label className="filein-label mb-2">App Reference</label>
            <input
              name="appReference"
              value={filters.appReference}
              onChange={onFilterChange}
              className="form-control filein-input"
            />
          </div>

          <div className="col-md-6 col-lg-4 col-xl-3">
            <label className="filein-label mb-2">Sender</label>
            <input
              name="sender"
              value={filters.sender}
              onChange={onFilterChange}
              className="form-control filein-input"
            />
          </div>

          <div className="col-md-6 col-lg-4 col-xl-3">
            <label className="filein-label mb-2">Receiver</label>
            <input
              name="receiver"
              value={filters.receiver}
              onChange={onFilterChange}
              className="form-control filein-input"
            />
          </div>

          <div className="col-md-6 col-lg-4 col-xl-3">
            <label className="filein-label mb-2">Flow Type</label>
            <input
              name="flowType"
              value={filters.flowType}
              onChange={onFilterChange}
              className="form-control filein-input"
            />
          </div>

          <div className="col-md-6 col-lg-4 col-xl-3">
            <label className="filein-label mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={onFilterChange}
              className="form-select filein-input"
            >
              <option value="">All</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn filein-btn-reset" onClick={onReset}>
            Reinitialize
          </button>
          <button className="btn filein-btn-search" onClick={onSearch}>
            Search
          </button>
        </div>
      </div>
    </div>
  );
}