import "../styles/FileInPage.css";

const FILE_OUT_STATUS_OPTIONS = [
  "INITIAL",
  "REJECTED",
  "ERRORREPORTEDTOSENDER",
  "SENT",
  "SENTANDWAITINGACK",
  "ACKED",
];

export default function FileOutSearchCard({
  filters,
  onFilterChange,
  onSearch,
  onReset,
  statusOptions = FILE_OUT_STATUS_OPTIONS,
  senderOptions = [],
  receiverOptions = [],
  flowTypeOptions = [],
}) {
  return (
    <div className="card filein-card">
      <div className="card-header filein-card-title">
        Detailed Search : <span className="accent">File OUT</span>
      </div>

      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="filein-label">App Reference</label>
            <input type="text" name="appReference" value={filters.appReference} onChange={onFilterChange} placeholder="Search app reference" className="form-control filein-input" />
          </div>

          <div className="col-md-3">
            <label className="filein-label">Sender Reference</label>
            <input type="text" name="senderReference" value={filters.senderReference} onChange={onFilterChange} placeholder="Search sender reference" className="form-control filein-input" />
          </div>

          <div className="col-md-3">
            <label className="filein-label">Sender</label>
            <select name="sender" value={filters.sender} onChange={onFilterChange} className="form-select filein-input">
              <option value="">All</option>
              {senderOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="col-md-3">
            <label className="filein-label">Receiver</label>
            <select name="receiver" value={filters.receiver} onChange={onFilterChange} className="form-select filein-input">
              <option value="">All</option>
              {receiverOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="col-md-3">
            <label className="filein-label">Flow Type</label>
            <select name="flowType" value={filters.flowType} onChange={onFilterChange} className="form-select filein-input">
              <option value="">All</option>
              {flowTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="col-md-3">
            <label className="filein-label">Status</label>
            <select name="status" value={filters.status} onChange={onFilterChange} className="form-select filein-input">
              <option value="">All</option>
              {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="col-md-3">
            <label className="filein-label">Creation Date From</label>
            <input type="date" name="creationDateFrom" value={filters.creationDateFrom} onChange={onFilterChange} className="form-control filein-input" />
          </div>

          <div className="col-md-3">
            <label className="filein-label">Creation Date To</label>
            <input type="date" name="creationDateTo" value={filters.creationDateTo} onChange={onFilterChange} className="form-control filein-input" />
          </div>
        </div>

        <div className="d-flex justify-content-between mt-3">
          <button className="btn btn-outline-success btn-sm" onClick={onReset}>
            Reinitialize
          </button>
          <button className="btn btn-primary btn-sm" onClick={onSearch}>
            Search
          </button>
        </div>
      </div>
    </div>
  );
}