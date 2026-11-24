import React, { useState } from 'react';
import { Save, RotateCcw, Wifi } from 'lucide-react';
import { getApiConfig, saveApiConfig, resetMockDatabase } from '../services/api.js';

export default function SettingsPage({
  settings,
  onSaveSettings,
  onRefreshAll,
  notify,
  userRole
}) {
  const [form, setForm] = useState({ ...settings });
  const [apiCfg, setApiCfg] = useState(() => getApiConfig());
  const [saving, setSaving] = useState(false);

  const isAdmin = userRole === 'admin';

  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSaveSettings(form);
    setSaving(false);
  };

  const handleSaveBackendConfig = async () => {
    saveApiConfig(apiCfg);
    notify(
      apiCfg.mode === 'production'
        ? 'Switched to Google Apps Script Production Mode'
        : 'Switched to Local Mock Development Mode',
      'success'
    );
    await onRefreshAll();
  };

  const handleResetDemo = async () => {
    resetMockDatabase();
    notify('Local mock database reset to default test data', 'info');
    await onRefreshAll();
  };

  return (
    <div className="page-scroll-container">
      <div className="page-header">
        <div className="page-title">
          <h2>Store & Backend Settings</h2>
          <p>Configure store identity, receipt preferences, loyalty rules, and Google Sheets sync.</p>
        </div>
      </div>

      <div className="reports-grid">
        <form onSubmit={handleSaveStoreSettings} className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 15 }}>Store & Receipt Configuration</h3>

          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              className="input"
              disabled={!isAdmin}
              value={form.store_name || ''}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Store Address</label>
            <input
              className="input"
              disabled={!isAdmin}
              value={form.store_address || ''}
              onChange={(e) => setForm({ ...form, store_address: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Store Phone</label>
              <input
                className="input"
                disabled={!isAdmin}
                value={form.store_phone || ''}
                onChange={(e) => setForm({ ...form, store_phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Default Receipt Width</label>
              <select
                className="select"
                disabled={!isAdmin}
                value={form.default_receipt_width || '80mm'}
                onChange={(e) => setForm({ ...form, default_receipt_width: e.target.value })}
              >
                <option value="58mm">58mm Thermal</option>
                <option value="80mm">80mm Thermal</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Default Payment Method</label>
              <select
                className="select"
                disabled={!isAdmin}
                value={form.default_payment_method || 'Cash'}
                onChange={(e) => setForm({ ...form, default_payment_method: e.target.value })}
              >
                <option value="Cash">Cash</option>
                <option value="QRIS">QRIS</option>
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Low Stock Alert Threshold</label>
              <input
                type="number"
                className="input"
                min="1"
                disabled={!isAdmin}
                value={form.low_stock_threshold ?? 10}
                onChange={(e) =>
                  setForm({ ...form, low_stock_threshold: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="form-grid-2">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                disabled={!isAdmin}
                checked={form.enable_member_points !== false}
                onChange={(e) =>
                  setForm({ ...form, enable_member_points: e.target.checked })
                }
              />
              Enable Member Points
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                disabled={!isAdmin}
                checked={form.enable_discounts !== false}
                onChange={(e) => setForm({ ...form, enable_discounts: e.target.checked })}
              />
              Enable Cashier Discounts
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Receipt Footer Message</label>
            <textarea
              className="textarea"
              rows={2}
              disabled={!isAdmin}
              value={form.receipt_footer || ''}
              onChange={(e) => setForm({ ...form, receipt_footer: e.target.value })}
            />
          </div>

          {isAdmin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={15} />
                {saving ? 'Saving...' : 'Save Store Settings'}
              </button>
            </div>
          )}
        </form>

        <div className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 15 }}>Google Apps Script & Database Connection</h3>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
            Use <strong>Mock Mode</strong> for offline local testing, or switch to{' '}
            <strong>Production Mode</strong> with your deployed Google Apps Script Web App URL.
          </p>

          <div className="form-group">
            <label className="form-label">Backend Environment Mode</label>
            <select
              className="select"
              value={apiCfg.mode}
              onChange={(e) => setApiCfg({ ...apiCfg, mode: e.target.value })}
            >
              <option value="mock">Development Mock Mode (localStorage)</option>
              <option value="production">Production (Google Apps Script + Sheets)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Google Apps Script Web App URL</label>
            <input
              type="url"
              className="input"
              value={apiCfg.webAppUrl}
              onChange={(e) => setApiCfg({ ...apiCfg, webAppUrl: e.target.value })}
              placeholder="https://script.google.com/macros/s/.../exec"
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={handleSaveBackendConfig}>
              <Wifi size={15} />
              Apply Connection Mode
            </button>
            {apiCfg.mode === 'mock' && (
              <button type="button" className="btn btn-secondary" onClick={handleResetDemo}>
                <RotateCcw size={15} />
                Reset Demo Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
