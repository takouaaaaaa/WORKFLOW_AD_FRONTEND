export default function FileOutSearchCard({
  filters,
  onFilterChange,
  onSearch,
  onReset,
  statusOptions = [],
  senderOptions = [],
  receiverOptions = [],
  flowTypeOptions = [],
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
              placeholder="Search app reference"
            />
          </div>

          <div className="col-md-6 col-lg-4 col-xl-3">
            <label className="filein-label mb-2">Sender Reference</label>
            <input
              name="senderReference"
              value={filters.senderReference}
              onChange={onFilterChange}
              className="form-control filein-input"
              placeholder="Search sender reference"
            />
          </div>

          <div className="col-md-6 col-lg-4 col-xl-3">
            <label className="filein-label mb-2">Sender</label>
            <select
              name="sender"
              value={filters.sender}
              onChange={onFilterChange}
              className="form-select filein-input"
            >
              <option value="">All</option>
              {senderOptions.map((sender, index) => (
                <option key={index} value={sender}>
                  {sender}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 col-lg-4 col-xl-3">
            <label className="filein-label mb-2">Receiver</label>
            <select
              name="receiver"
              value={filters.receiver}
              onChange={onFilterChange}
              className="form-select filein-input"
            >
              <option value="">All</option>
              {receiverOptions.map((receiver, index) => (
                <option key={index} value={receiver}>
                  {receiver}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 col-lg-4 col-xl-3">
            <label className="filein-label mb-2">Flow Type</label>
            <select
              name="flowType"
              value={filters.flowType}
              onChange={onFilterChange}
              className="form-select filein-input"
            >
              <option value="">All</option>
              {flowTypeOptions.map((flowType, index) => (
                <option key={index} value={flowType}>
                  {flowType}
                </option>
              ))}
            </select>
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

          <div className="col-12 col-xl-6">
            <label className="filein-label mb-2 d-block">Creation Date</label>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span
                className="filein-label"
                style={{ fontSize: "11px", opacity: 0.7, minWidth: "32px" }}
              >
                from
              </span>

              <input
                type="date"
                name="creationDateFrom"
                value={filters.creationDateFrom}
                onChange={onFilterChange}
                className="form-control filein-input"
                style={{ flex: 1, minWidth: "180px" }}
              />

              <span
                className="filein-label"
                style={{ fontSize: "11px", opacity: 0.7, minWidth: "20px" }}
              >
                to
              </span>

              <input
                type="date"
                name="creationDateTo"
                value={filters.creationDateTo}
                onChange={onFilterChange}
                className="form-control filein-input"
                style={{ flex: 1, minWidth: "180px" }}
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn filein-btn-reset" onClick={onReset}>
            Reinitialize
          </button>
          <button type="button" className="btn filein-btn-search" onClick={onSearch}>
            Search
          </button>
        </div>
      </div>
    </div>
  );
}