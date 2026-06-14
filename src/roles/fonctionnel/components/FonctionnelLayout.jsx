

import { useState } from "react";
import Topbar from "../components/Topbar";
import FonctionnelDashboard from "./FonctionnelDashboard";

export default function FonctionnelLayout({ email, role, phone, onLogout, onSaveProfile, sidebarCollapsed, onToggleSidebar }) {

  // 1. How many CBR unread alerts (FonctionnelDashboard tells us)
  const [cbrUnreadCount, setCbrUnreadCount] = useState(0);

  // 2. Whether the notification panel is open
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>

      {/* Topbar receives unread count + bell click handler */}
      <Topbar
        email={email}
        role={role}
        phone={phone}
        onLogout={onLogout}
        onSaveProfile={onSaveProfile}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
        // ── CBR props ──
        cbrUnreadCount={cbrUnreadCount}
        onCbrBellClick={() => setNotifOpen((v) => !v)}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* sidebar here */}

        <main style={{ flex: 1, overflowY: "auto" }}>
          {/* Dashboard tells parent how many unread + reacts to open state */}
          <FonctionnelDashboard
            onCbrUnreadChange={setCbrUnreadCount}
            notifOpen={notifOpen}
            onNotifToggle={setNotifOpen}
          />
        </main>
      </div>
    </div>
  );
}