import React, { useState, useEffect } from 'react';
import { Store, Search, UserCheck } from 'lucide-react';

export default function Header({
  storeName,
  user,
  apiMode,
  globalSearch,
  onGlobalSearchChange,
  searchInputRef,
  onOpenUserModal,
  onNavigateSettings
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const dateString = now.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const isProd = apiMode === 'production';

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-logo">
          <Store size={19} />
        </div>
        <div className="brand-info">
          <h1>{storeName || 'NusaMart POS'}</h1>
          <span>Retail Point of Sale</span>
        </div>
      </div>

      <div className="header-search">
        <Search size={15} className="search-icon" />
        <input
          ref={searchInputRef}
          type="text"
          value={globalSearch}
          onChange={(e) => onGlobalSearchChange(e.target.value)}
          placeholder="Search product name, SKU, or scan barcode..."
          aria-label="Search products"
        />
        <span className="kbd-hint">F2</span>
      </div>

      <div className="header-meta">
        <div className="shortcut-strip" title="Keyboard shortcuts">
          <span className="shortcut-pill">
            <kbd>F2</kbd> Search
          </span>
          <span className="shortcut-pill">
            <kbd>F4</kbd> Pay
          </span>
          <span className="shortcut-pill">
            <kbd>F8</kbd> Clear
          </span>
          <span className="shortcut-pill">
            <kbd>Esc</kbd> Close
          </span>
        </div>

        <button
          type="button"
          className={`status-badge ${isProd ? 'prod' : 'mock'}`}
          onClick={onNavigateSettings}
          title="Click to configure Google Sheets connection"
        >
          <span className="status-dot" />
          {isProd ? 'Sheets Connected' : 'Mock Mode (Local)'}
        </button>

        <div className="clock-box">
          <div className="clock-time">{timeString}</div>
          <div className="clock-date">{dateString}</div>
        </div>

        <button
          type="button"
          className="cashier-btn"
          onClick={onOpenUserModal}
          title="Switch cashier or login"
        >
          <div className="cashier-avatar">
            {(user?.name || 'C').slice(0, 1).toUpperCase()}
          </div>
          <div className="cashier-details">
            <span className="cashier-name">{user?.name || 'Cashier'}</span>
            <span className="cashier-role">{user?.role || 'cashier'}</span>
          </div>
          <UserCheck size={14} color="var(--text-muted)" />
        </button>
      </div>
    </header>
  );
}
