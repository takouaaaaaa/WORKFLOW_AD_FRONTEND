export default function FileInFilters({
  filters,
  onChange,
  onReset,
  onSearch,
  senderOptions = [],
  receiverOptions = [],
  flowTypeOptions = [],
}) {
  return (
    <div className="filein-card mb-4">
      <div className="filein-card-title">Detailed Search : File IN</div>

      <div className="filein-card-body">
        <div className="row g-3">
          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label filein-label">App Reference</label>
            <input
              className="form-control filein-input"
              name="appReference"
              value={filters.appReference}
              onChange={onChange}
              placeholder="Search app reference"
            />
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label filein-label">Sender Reference</label>
            <input
              className="form-control filein-input"
              name="senderReference"
              value={filters.senderReference}
              onChange={onChange}
              placeholder="Search sender reference"
            />
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label filein-label">Status</label>
            <select
              className="form-select filein-input"
              name="status"
              value={filters.status}
              onChange={onChange}
            >
              <option value="">All</option>
              <option value="PROCESSED">PROCESSED</option>
              <option value="INPROCESS">INPROCESS</option>
              <option value="REJECTED">REJECTED</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="INITIATED">INITIATED</option>
              <option value="ARCHIVED">ARCHIVED</option>
              <option value="INTECHNICALERROR">INTECHNICALERROR</option>
              <option value="INBUSINESSERROR">INBUSINESSERROR</option>
              <option value="WAITACTION">WAITACTION</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="CANCELED">CANCELED</option>
              <option value="INIT">INIT</option>
              <option value="NOCONTRACTFOUND">NOCONTRACTFOUND</option>
              <option value="PUTINQUEUEFAILED">PUTINQUEUEFAILED</option>
            </select>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label filein-label">Category</label>
            <select
              className="form-select filein-input"
              name="category"
              value={filters.category}
              onChange={onChange}
            >
              <option value="">All</option>
              <option value="ACQUISITION">ACQUISITION</option>
              <option value="RESTITUTION">RESTITUTION</option>
            </select>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label filein-label">Sender</label>
            <select
              className="form-select filein-input"
              name="sender"
              value={filters.sender}
              onChange={onChange}
            >
              <option value="">All</option>
              {senderOptions.map((sender, index) => (
                <option key={index} value={sender}>
                  {sender}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label filein-label">Receiver</label>
            <select
              className="form-select filein-input"
              name="receiver"
              value={filters.receiver}
              onChange={onChange}
            >
              <option value="">All</option>
              {receiverOptions.map((receiver, index) => (
                <option key={index} value={receiver}>
                  {receiver}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label filein-label">Flow Type</label>
            <select
              className="form-select filein-input"
              name="flowType"
              value={filters.flowType}
              onChange={onChange}
            >
              <option value="">All</option>
              {flowTypeOptions.map((flowType, index) => (
                <option key={index} value={flowType}>
                  {flowType}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label filein-label">Sending Date From</label>
            <input
              type="date"
              className="form-control filein-input"
              name="sendingDateFrom"
              value={filters.sendingDateFrom}
              onChange={onChange}
            />
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label filein-label">Sending Date To</label>
            <input
              type="date"
              className="form-control filein-input"
              name="sendingDateTo"
              value={filters.sendingDateTo}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
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