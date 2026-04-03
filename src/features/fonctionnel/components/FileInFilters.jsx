export default function FileInFilters({ filters, onChange, onReset, onSearch }) {
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
            <input
              className="form-control filein-input"
              name="sender"
              value={filters.sender}
              onChange={onChange}
              placeholder="Search sender"
            />
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <label className="form-label filein-label">Receiver</label>
            <input
              className="form-control filein-input"
              name="receiver"
              value={filters.receiver}
              onChange={onChange}
              placeholder="Search receiver"
            />
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