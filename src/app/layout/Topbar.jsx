import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
  Bell,
} from "lucide-react";
import "./topbar.css";

const PWD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#])[A-Za-z\d@$!%*?&._\-#]{8,}$/;

function getInitials(email) {
  if (!email) return "?";
  const [local] = email.split("@");
  const parts = local.split(/[._\-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

function formatRole(role) {
  if (!role) return "";
  if (role === "ADMIN") return "ADMIN";
  if (role === "USER_FONCTIONNEL") return "FONCTIONNEL";
  if (role === "USER_TECHNIQUE") return "TECHNIQUE";
  return role;
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
  const [phone, setPhone] = useState(initialPhone ? String(initialPhone) : "");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdOk, setPwdOk] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    setPhone(initialPhone ? String(initialPhone) : "");
  }, [initialPhone]);

  function validate(newPwd = pwd, newConfirm = confirmPwd) {
    if (newPwd.length === 0) {
      setPwdError("");
      setPwdOk(false);
      setConfirmError("");
      return;
    }

    if (!PWD_PATTERN.test(newPwd)) {
      setPwdError(
        "8+ chars, uppercase, lowercase, digit & special char (@$!%*?&._-#)"
      );
      setPwdOk(false);
    } else {
      setPwdError("");
      setPwdOk(true);
    }

    if (newConfirm.length > 0) {
      setConfirmError(newPwd !== newConfirm ? "Passwords do not match" : "");
    } else {
      setConfirmError("");
    }
  }

  function handlePwdChange(e) {
    const value = e.target.value;
    setPwd(value);
    validate(value, confirmPwd);
  }

  function handleConfirmChange(e) {
    const value = e.target.value;
    setConfirmPwd(value);
    validate(pwd, value);
  }

  const canSave =
    !saving && (pwd.length === 0 ? true : pwdOk && confirmPwd === pwd);

  async function handleSave() {
    if (!onSaveProfile) return;

    try {
      setSaving(true);

      await onSaveProfile({
        numTel: phone ? Number(phone) : null,
        motDePasse: pwd || undefined,
      });

      setPwd("");
      setConfirmPwd("");
      setPwdError("");
      setPwdOk(false);
      setConfirmError("");
      setOpen(false);

      alert("Profile updated successfully");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    
    <div className="app-topbar">
      <div className="app-topbar-left">
        <button
          className="app-sidebar-toggle-topbar"
          onClick={onToggleSidebar}
          type="button"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>

        <div className="app-brand-block">
          <div className="app-logo-mark"><img src="src/assets/vermegLogo.jpeg" alt="Logo" height="30" /></div>
          <div className="app-brand-text">
            <div className="app-logo">WORKFLOW-AD</div>
            <div className="app-topbar-subtitle">Flow monitoring platform</div>
          </div>
        </div>
      </div>

      <div className="app-topbar-right">
        

      

        {role && <span className="app-badge">{formatRole(role)}</span>}

        <button
          className="app-profile-trigger"
          onClick={() => setOpen((v) => !v)}
          type="button"
          aria-label="Profile"
        >
          <div className="app-avatar-btn">
            {email ? getInitials(email) : <User size={16} />}
          </div>

          <div className="app-profile-meta">
            <span className="app-profile-email">{email ?? "User"}</span>
            <span className="app-profile-role">{formatRole(role)}</span>
          </div>
        </button>

        {open && (
          <div className="profile-dropdown" ref={dropdownRef}>
            <div className="profile-dropdown-header">
              <div className="profile-avatar-large">
                {email ? getInitials(email) : <User size={20} />}
              </div>

              <div>
                <div className="profile-name">{email ?? "—"}</div>
                {role && <div className="profile-role">{formatRole(role)}</div>}
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
                  placeholder="12345678"
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
                {pwdOk && !pwdError && (
                  <span className="profile-hint ok">Password looks good</span>
                )}
                {!pwd && (
                  <span className="profile-hint">
                    Min 8 chars · upper & lowercase · digit · special char
                  </span>
                )}
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
                  {confirmError && (
                    <span className="profile-hint err">{confirmError}</span>
                  )}
                  {!confirmError && confirmPwd && confirmPwd === pwd && (
                    <span className="profile-hint ok">Passwords match</span>
                  )}
                </div>
              )}
            </div>

            <div className="profile-dropdown-footer">
              <button
                className="btn-cancel"
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="btn-save"
                type="button"
                disabled={!canSave}
                onClick={handleSave}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        )}

        <button className="app-logout-btn" onClick={onLogout} type="button">
          Logout
        </button>
      </div>
    </div>
  );
}