/**
 * Reusable single-field modal used by Senders, Receivers, and TypeFlux pages.
 * Props:
 *   show        — boolean
 *   onClose     — fn
 *   title       — string  e.g. "Add Sender" | "Edit Receiver"
 *   label       — string  e.g. "Sender" | "Flow Type"
 *   value       — string
 *   onChange    — fn(newValue)
 *   placeholder — string
 *   onSave      — fn
 */
export default function CrudModal({ show, onClose, title, label, value, onChange, placeholder, onSave }) {
  if (!show) return null;

  return (
    <div className="fi-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fi-modal">
        <div className="fi-modal-header">
          <span className="fi-modal-title">{title}</span>
          <button className="fi-modal-close" type="button" onClick={onClose}>✕</button>
        </div>

        <div className="fi-modal-body">
          <div className="fi-field">
            <label className="filein-label">{label}</label>
            <input
              className="filein-input"
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            />
          </div>
        </div>

        <div className="fi-modal-footer">
          <button className="fi-btn-cancel" type="button" onClick={onClose}>Cancel</button>
          <button className="fi-btn-save" type="button" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}