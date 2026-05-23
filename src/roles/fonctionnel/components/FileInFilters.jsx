export default function FileInFilters({
  filters,
  onChange,
  onReset,
  onSearch,
  senderOptions = [],
  flowTypeOptions = [],
}) {
  return (
    <div className="filein-card">
      <div className="filein-card-title">
        <span>Detailed Search : <span className="accent">File IN</span></span>
      </div>

      <div className="filein-card-body">
        <div className="filein-filter-grid">

          <div className="filein-filter-field">
            <label className="filein-label">App Reference</label>
            <input
              className="filein-input"
              name="appReference"
              value={filters.appReference}
              onChange={onChange}
              placeholder="Search app reference"
            />
          </div>

          <div className="filein-filter-field">
            <label className="filein-label">Sender Reference</label>
            <input
              className="filein-input"
              name="senderReference"
              value={filters.senderReference}
              onChange={onChange}
              placeholder="Search sender reference"
            />
          </div>

          {/* StatutFileIn enum values only */}
          <div className="filein-filter-field">
            <label className="filein-label">Status</label>
            <select className="filein-input" name="status" value={filters.status} onChange={onChange}>
              <option value="">All</option>
              <option value="INIT">INIT</option>
              <option value="INPROCESS">INPROCESS</option>
              <option value="PROCESSED">PROCESSED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="ARCHIVED">ARCHIVED</option>
              <option value="INTECHNICALERROR">INTECHNICALERROR</option>
              <option value="INBUSINESSERROR">INBUSINESSERROR</option>
              <option value="WAITACTION">WAITACTION</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="CANCELED">CANCELED</option>
            </select>
          </div>

          <div className="filein-filter-field">
            <label className="filein-label">Category</label>
            <select className="filein-input" name="category" value={filters.category} onChange={onChange}>
              <option value="">All</option>
              <option value="ACQUISITION">ACQUISITION</option>
              <option value="RESTITUTION">RESTITUTION</option>
            </select>
          </div>

          <div className="filein-filter-field">
            <label className="filein-label">Sender</label>
            <select className="filein-input" name="sender" value={filters.sender} onChange={onChange}>
              <option value="">All</option>
              {senderOptions.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="filein-filter-field">
            <label className="filein-label">Flow Type</label>
            <select className="filein-input" name="flowType" value={filters.flowType} onChange={onChange}>
              <option value="">All</option>
              {flowTypeOptions.map((f, i) => <option key={i} value={f}>{f}</option>)}
            </select>
          </div>

          <div />

          <div className="filein-filter-field" style={{ gridColumn: "span 2" }}>
            <label className="filein-label">Sending Date</label>
            <div className="filein-filter-range">
              <span className="filein-filter-range-sep">from</span>
              <input type="date" className="filein-input" name="sendingDateFrom" value={filters.sendingDateFrom} onChange={onChange} style={{ flex: 1 }} />
              <span className="filein-filter-range-sep">to</span>
              <input type="date" className="filein-input" name="sendingDateTo" value={filters.sendingDateTo} onChange={onChange} style={{ flex: 1 }} />
            </div>
          </div>

          <div className="filein-filter-field" style={{ gridColumn: "span 2" }}>
            <label className="filein-label">Total Amount</label>
            <div className="filein-filter-range">
              <span className="filein-filter-range-sep">from</span>
              <input type="number" step="0.01" className="filein-input" name="totalAmountFrom" value={filters.totalAmountFrom || ""} onChange={onChange} placeholder="Min" style={{ flex: 1 }} />
              <span className="filein-filter-range-sep">to</span>
              <input type="number" step="0.01" className="filein-input" name="totalAmountTo" value={filters.totalAmountTo || ""} onChange={onChange} placeholder="Max" style={{ flex: 1 }} />
            </div>
          </div>

        </div>

        <div className="filein-filter-actions" style={{ marginTop: "16px" }}>
          <button type="button" className="filein-btn-reset" onClick={onReset}>Reinitialize</button>
          <button type="button" className="filein-btn-search" onClick={onSearch}>Search</button>
        </div>
      </div>
    </div>
  );
}