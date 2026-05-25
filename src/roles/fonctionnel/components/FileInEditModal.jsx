export default function FileInEditModal({
  show,
  onClose,
  editData,
  setEditData,
  onSave,
  flowTypeOptions = [],
  senderOptions = [],
}) {
  if (!show) return null;

  const set = (field) => (e) =>
    setEditData((prev) => ({ ...prev, [field]: e.target.value }));

  const toDateTimeLocal = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d)) return "";

    const p = (n) => String(n).padStart(2, "0");

    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(
      d.getHours()
    )}:${p(d.getMinutes())}`;
  };

  const getFlowTypeValue = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    return item.flowType || item.FlowType || item.name || item.type || "";
  };

  const getFlowTypeId = (item) => {
    if (!item || typeof item === "string") return "";
    return item.id || item.idTypeFlux || item.typeFluxId || "";
  };

  const getSenderName = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    return item.sender || item.senderName || item.name || "";
  };

  const getSenderId = (item) => {
    if (!item || typeof item === "string") return "";
    return item.id || item.senderId || item.idSender || "";
  };

  const currentFlowType =
    editData.flowType ||
    editData.flux?.typeFlux?.flowType ||
    editData.flux?.typeFlux?.FlowType ||
    "";

  const currentSender =
    editData.senderName ||
    editData.flux?.sender?.sender ||
    editData.sender ||
    "";

  const handleFlowTypeChange = (e) => {
    const value = e.target.value;
    const selected = flowTypeOptions.find(
      (item) => getFlowTypeValue(item) === value
    );

    setEditData((prev) => ({
      ...prev,
      flowType: value,
      typeFluxId: getFlowTypeId(selected) || prev.typeFluxId,
    }));
  };

  const handleSenderChange = (e) => {
    const value = e.target.value;
    const selected = senderOptions.find((item) => getSenderName(item) === value);

    setEditData((prev) => ({
      ...prev,
      senderName: value,
      sender: value,
      senderId: getSenderId(selected) || prev.senderId,
    }));
  };

  return (
    <div
      className="fi-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="fi-modal">
        <div className="fi-modal-header">
          <span className="fi-modal-title">Edit File IN</span>
          <button className="fi-modal-close" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="fi-modal-body">
          <div className="fi-field">
            <label className="filein-label">Status</label>
            <select
              className="filein-input"
              value={editData.status || ""}
              onChange={set("status")}
            >
              <option value="">-- Select --</option>
              <option value="INIT">INIT</option>
              <option value="WAITPROCESS">WAITPROCESS</option>
              <option value="INPROCESS">INPROCESS</option>
              <option value="PROCESSED">PROCESSED</option>
              <option value="PUTINQUEUEFAILED">PUTINQUEUEFAILED</option>
              <option value="INTECHNICALERROR">INTECHNICALERROR</option>
              <option value="INBUSINESSERROR">INBUSINESSERROR</option>
              <option value="REJECTED">REJECTED</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="ARCHIVED">ARCHIVED</option>
              <option value="WAITACTION">WAITACTION</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="CANCELED">CANCELED</option>
            </select>
          </div>

          <div className="fi-field">
            <label className="filein-label">Category</label>
            <select
              className="filein-input"
              value={editData.category || ""}
              onChange={set("category")}
            >
              <option value="">-- Select --</option>
              <option value="ACQUISITION">ACQUISITION</option>
              <option value="RESTITUTION">RESTITUTION</option>
            </select>
          </div>

          <div className="fi-field">
            <label className="filein-label">Sender</label>
            <select
              className="filein-input"
              value={currentSender}
              onChange={handleSenderChange}
            >
              <option value="">-- Select --</option>

              {currentSender && (
                <option value={currentSender}>{currentSender}</option>
              )}

              {senderOptions.map((item) => {
                const value = getSenderName(item);
                if (!value || value === currentSender) return null;

                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="fi-field">
            <label className="filein-label">Flow Type</label>
            <select
              className="filein-input"
              value={currentFlowType}
              onChange={handleFlowTypeChange}
            >
              <option value="">-- Select --</option>

              {currentFlowType && (
                <option value={currentFlowType}>{currentFlowType}</option>
              )}

              {flowTypeOptions.map((item) => {
                const value = getFlowTypeValue(item);
                if (!value || value === currentFlowType) return null;

                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="fi-field">
            <label className="filein-label">Sender Reference</label>
            <input
              className="filein-input"
              type="text"
              value={editData.senderReference || ""}
              onChange={set("senderReference")}
            />
          </div>

          <div className="fi-field">
            <label className="filein-label">Total Amount</label>
            <input
              className="filein-input"
              type="number"
              step="0.01"
              min="0"
              value={editData.totalAmount ?? ""}
              onChange={set("totalAmount")}
            />
          </div>

          <div className="fi-field">
            <label className="filein-label">Sending Date</label>
            <input
              className="filein-input"
              type="datetime-local"
              value={toDateTimeLocal(editData.sendingDate)}
              onChange={set("sendingDate")}
            />
          </div>

          <div className="fi-field">
            <label className="filein-label">Settlement Date</label>
            <input
              className="filein-input"
              type="datetime-local"
              value={toDateTimeLocal(editData.settlementDate)}
              onChange={set("settlementDate")}
            />
          </div>

          <div className="fi-field fi-field-full">
            <label className="filein-label">Description</label>
            <textarea
              className="filein-input"
              rows={3}
              value={editData.descriptionFileIn || ""}
              onChange={set("descriptionFileIn")}
            />
          </div>
        </div>

        <div className="fi-modal-footer">
          <button className="fi-btn-cancel" type="button" onClick={onClose}>
            Cancel
          </button>

          <button className="fi-btn-save" type="button" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}