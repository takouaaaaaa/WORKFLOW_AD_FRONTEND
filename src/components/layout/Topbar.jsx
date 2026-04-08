import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, User } from "lucide-react";

const PWD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#])[A-Za-z\d@$!%*?&._\-#]{8,}$/;

function getInitials(email) {
  if (!email) return "?";
  const [local] = email.split("@");
  const parts = local.split(/[._\-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

export default function Topbar({
  email,
  role,
  phone: initialPhone = "",
  onLogout,
  onToggleSidebar,
  sidebarCollapsed,
  onSaveProfile,
}) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(initialPhone);
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdOk, setPwdOk] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function validate(newPwd = pwd, newConfirm = confirmPwd) {
    if (newPwd.length === 0) {
      setPwdError(""); setPwdOk(false); setConfirmError(""); return;
    }
    if (!PWD_PATTERN.test(newPwd)) {
      setPwdError("8+ chars, uppercase, lowercase, digit & special char (@$!%*?&._-#)");
      setPwdOk(false);
    } else {
      setPwdError(""); setPwdOk(true);
    }
    if (newConfirm.length > 0) {
      setConfirmError(newPwd !== newConfirm ? "Passwords do not match" : "");
    } else {
      setConfirmError("");
    }
  }

  function handlePwdChange(e) { setPwd(e.target.value); validate(e.target.value, confirmPwd); }
  function handleConfirmChange(e) { setConfirmPwd(e.target.value); validate(pwd, e.target.value); }

  const canSave = pwd.length === 0 ? true : pwdOk && confirmPwd === pwd;

  function handleSave() {
    onSaveProfile?.({ phone, password: pwd || undefined });
    setPwd(""); setConfirmPwd(""); setPwdError(""); setPwdOk(false); setConfirmError("");
    setOpen(false);
  }

  return (
    <>
      <style>{`
        .app-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 56px;

  /* 🔥 CHANGE THIS */
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);

  border-bottom: 1px solid rgba(255,255,255,0.1);
  position: relative;
  z-index: 100;
}
        .app-topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .app-topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }
        .app-sidebar-toggle-topbar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #f4f4f6;
          border: 1px solid #e8e8ed;
          border-radius: 8px;
          cursor: pointer;
          color: #666;
          transition: background 0.15s;
        }
        .app-sidebar-toggle-topbar:hover { background: #eaeaee; }
        .app-logo {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #1a1a2e;
        }
        .app-topbar-label { font-size: 13px; color: #888; }
        .app-divider { color: #ccc; font-size: 16px; }
        .app-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          background: #eef2ff;
          color: #4f46e5;
          letter-spacing: 0.02em;
        }
        .app-avatar-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1.5px #d0d0e0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          transition: box-shadow 0.15s;
        }
        .app-avatar-btn:hover { box-shadow: 0 0 0 2px #667eea; }
        .app-logout-btn {
          font-size: 13px;
          font-weight: 500;
          padding: 6px 14px;
          border: 1px solid #e0e0e8;
          border-radius: 8px;
          background: #fff;
          color: #555;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .app-logout-btn:hover { background: #f7f7fb; border-color: #ccc; }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 310px;
          background: #fff;
          border: 1px solid #e4e4ec;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.10), 0 1.5px 4px rgba(0,0,0,0.06);
          z-index: 300;
          overflow: hidden;
        }
        .profile-dropdown-header {
          padding: 18px 18px 14px;
          background: linear-gradient(135deg, #f0f0ff 0%, #f8f4ff 100%);
          border-bottom: 1px solid #e4e4ec;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .profile-avatar-large {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 600;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(102,126,234,0.35);
        }
        .profile-name { font-size: 14px; font-weight: 600; color: #1a1a2e; }
        .profile-role { font-size: 12px; color: #6b6b8a; margin-top: 2px; }
        .profile-dropdown-body {
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 13px;
          background: #fff;
        }
        .profile-field { display: flex; flex-direction: column; gap: 4px; }
        .profile-field-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #9999b3;
        }
        .profile-field-readonly {
          font-size: 13px;
          color: #6b6b8a;
          background: #f5f5fa;
          border: 1px solid #e8e8f0;
          border-radius: 8px;
          padding: 8px 11px;
        }
        .profile-field-input {
          font-size: 13px;
          color: #1a1a2e;
          background: #fff;
          border: 1px solid #d8d8e8;
          border-radius: 8px;
          padding: 8px 11px;
          width: 100%;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .profile-field-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.12);
        }
        .profile-hint { font-size: 11px; color: #aaaacc; line-height: 1.4; }
        .profile-hint.err { color: #e05252; }
        .profile-hint.ok  { color: #3cb97a; }
        .profile-dropdown-footer {
          padding: 12px 18px;
          border-top: 1px solid #ebebf5;
          background: #fafafa;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .btn-cancel {
          font-size: 13px;
          font-weight: 500;
          padding: 7px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fff;
          color: #666;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-cancel:hover { background: #f4f4f8; }
        .btn-save {
          font-size: 13px;
          font-weight: 600;
          padding: 7px 16px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
        }
        .btn-save:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-save:disabled { opacity: 0.4; cursor: default; }
      `}</style>

      <div className="app-topbar">
        <div className="app-topbar-left">
          <button className="app-sidebar-toggle-topbar" onClick={onToggleSidebar} type="button">
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <div className="app-logo">⬡ CURE</div>
        </div>

        <div className="app-topbar-right">
          <span className="app-topbar-label">Cure Dashboard</span>
          <span className="app-divider">|</span>
          {role && <span className="app-badge">{role}</span>}

          <button className="app-avatar-btn" onClick={() => setOpen((v) => !v)} type="button" aria-label="Profile">
            {email ? getInitials(email) : <User size={16} />}
          </button>

          {open && (
            <div className="profile-dropdown" ref={dropdownRef}>
              <div className="profile-dropdown-header">
                <div className="profile-avatar-large">
                  {email ? getInitials(email) : <User size={20} />}
                </div>
                <div>
                  <div className="profile-name">{email ?? "—"}</div>
                  {role && <div className="profile-role">{role}</div>}
                </div>
              </div>

              <div className="profile-dropdown-body">
                <div className="profile-field">
                  <span className="profile-field-label">Email</span>
                  <div className="profile-field-readonly">{email ?? "—"}</div>
                </div>

                <div className="profile-field">
                  <span className="profile-field-label">Phone number</span>
                  <input
                    className="profile-field-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+X XX XXX XXX"
                  />
                </div>

                <div className="profile-field">
                  <span className="profile-field-label">New password</span>
                  <input
                    className="profile-field-input"
                    type="password"
                    value={pwd}
                    onChange={handlePwdChange}
                    placeholder="Leave blank to keep current"
                  />
                  {pwdError && <span className="profile-hint err">{pwdError}</span>}
                  {pwdOk && !pwdError && <span className="profile-hint ok">Password looks good</span>}
                  {!pwd && <span className="profile-hint">Min 8 chars · upper &amp; lowercase · digit · special char</span>}
                </div>

                {pwd.length > 0 && (
                  <div className="profile-field">
                    <span className="profile-field-label">Confirm password</span>
                    <input
                      className="profile-field-input"
                      type="password"
                      value={confirmPwd}
                      onChange={handleConfirmChange}
                      placeholder="Repeat new password"
                    />
                    {confirmError && <span className="profile-hint err">{confirmError}</span>}
                    {!confirmError && confirmPwd && confirmPwd === pwd && (
                      <span className="profile-hint ok">Passwords match</span>
                    )}
                  </div>
                )}
              </div>

              <div className="profile-dropdown-footer">
                <button className="btn-cancel" type="button" onClick={() => setOpen(false)}>Cancel</button>
                <button className="btn-save" type="button" disabled={!canSave} onClick={handleSave}>Save changes</button>
              </div>
            </div>
          )}

          <button className="app-logout-btn" onClick={onLogout} type="button">Logout</button>
        </div>
      </div>
    </>
  );
}