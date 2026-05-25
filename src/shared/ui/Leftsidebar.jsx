function UserSidebar({ activePage, onNavigate }) {
  const items = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      id: "file-in",
      label: "File IN",
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="12" x2="12" y2="18" />
          <polyline points="9 15 12 18 15 15" />
        </svg>
      ),
    },
    {
      id: "file-out",
      label: "File OUT",
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <polyline points="9 15 12 12 15 15" />
        </svg>
      ),
    },
    {
      id: "monitoring",
      label: "Monitoring",
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
        </svg>
      ),
    },
  ];

  return (
    <div className="palm-sidebar">
      <div className="palm-sidebar-section">Main</div>
      {items.map((item) => (
        <div
          key={item.id}
          className={`palm-nav-item ${activePage === item.id ? "active" : ""}`}
          onClick={() => onNavigate(item.id)}
        >
          {item.icon}
          {item.label}
        </div>
      ))}
      <div className="palm-sidebar-section" style={{ marginTop: 12 }}>Links</div>
      <div className="palm-nav-item">🏦 Bank of France</div>
      <div className="palm-nav-item">📖 WIKI CURE</div>
    </div>
  );
}
