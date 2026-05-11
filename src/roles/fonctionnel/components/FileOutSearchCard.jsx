import "../../fonctionnel/styles/FileInPage.css";

// StatutFileOut enum values only
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
  senderOptions,
  receiverOptions,
  flowTypeOptions,
}) {
  return (
    <div className="filein-card">
      <div className="filein-card-title">
        <span>Detailed Search : <span className="accent">File OUT</span></span>
      </div>

      <div className="filein-card-body">
        <div className="filein-filter-grid">

          <div className="filein-filter-field">
            <label className="filein-label">App Reference</label>
            <input
              type="text"
              name="appReference"
              value={filters.appReference}
              onChange={onFilterChange}
              placeholder="Search app reference"
              className="filein-input"
            />
          </div>

          <div className="filein-filter-field">
            <label className="filein-label">Sender Reference</label>
            <input
              type="text"
              name="senderReference"
              value={filters.senderReference}
              onChange={onFilterChange}
              placeholder="Search sender reference"
              className="filein-input"
            />
          </div>

          <div className="filein-filter-field">
            <label className="filein-label">Sender</label>
            <select name="sender" value={filters.sender} onChange={onFilterChange} className="filein-input">
              <option value="">All</option>
              {senderOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="filein-filter-field">
            <label className="filein-label">Receiver</label>
            <select name="receiver" value={filters.receiver} onChange={onFilterChange} className="filein-input">
              <option value="">All</option>
              {receiverOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="filein-filter-field">
            <label className="filein-label">Flow Type</label>
            <select name="flowType" value={filters.flowType} onChange={onFilterChange} className="filein-input">
              <option value="">All</option>
              {flowTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="filein-filter-field">
            <label className="filein-label">Status</label>
            <select name="status" value={filters.status} onChange={onFilterChange} className="filein-input">
              <option value="">All</option>
              {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="filein-filter-field" style={{ gridColumn: "span 2" }}>
            <label className="filein-label">Creation Date</label>
            <div className="filein-filter-range">
              <span className="filein-filter-range-sep">from</span>
              <input
                type="date"
                name="creationDateFrom"
                value={filters.creationDateFrom}
                onChange={onFilterChange}
                className="filein-input"
                style={{ flex: 1 }}
              />
              <span className="filein-filter-range-sep">to</span>
              <input
                type="date"
                name="creationDateTo"
                value={filters.creationDateTo}
                onChange={onFilterChange}
                className="filein-input"
                style={{ flex: 1 }}
              />
            </div>
          </div>

        </div>

        <div className="filein-filter-actions" style={{ marginTop: "16px" }}>
          <button className="filein-btn-reset" onClick={onReset}>Reinitialize</button>
          <button className="filein-btn-search" onClick={onSearch}>Search</button>
        </div>
      </div>
    </div>
  );
}