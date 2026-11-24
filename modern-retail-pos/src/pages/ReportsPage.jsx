import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';
import { formatIDR } from '../utils/currency.js';

export default function ReportsPage({ notify }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    const res = await api.getReports();
    if (res.success && res.data) {
      setReport(res.data);
    } else {
      notify?.(res.message || 'Failed to load reports', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading || !report) {
    return (
      <div className="page-scroll-container">
        <div className="page-header">
          <div className="page-title">
            <h2>Sales Reports</h2>
            <p>Loading store performance metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalPaymentRevenue = report.paymentBreakdown.reduce((s, p) => s + p.total, 0) || 1;
  const maxDailySales = Math.max(...report.dailySales.map((d) => d.total), 1);

  return (
    <div className="page-scroll-container">
      <div className="page-header">
        <div className="page-title">
          <h2>Sales & Performance Overview</h2>
          <p>Today&apos;s store summary, payment distribution, and top-performing SKUs.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={loadReports}>
          <RefreshCw size={15} />
          Refresh Data
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Today&apos;s Sales</div>
          <div className="kpi-value" style={{ color: 'var(--accent-primary)' }}>
            {formatIDR(report.todaySales)}
          </div>
          <div className="kpi-sub">Net revenue after discounts</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Transactions</div>
          <div className="kpi-value">{report.totalTransactions}</div>
          <div className="kpi-sub">Completed orders today</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Items Sold</div>
          <div className="kpi-value">{report.totalItemsSold}</div>
          <div className="kpi-sub">Units checked out today</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Average Transaction</div>
          <div className="kpi-value">{formatIDR(report.averageTransaction)}</div>
          <div className="kpi-sub">Per receipt average today</div>
        </div>
      </div>

      <div className="reports-grid">
        <div className="surface-card">
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Payment Method Breakdown</h3>
          {report.paymentBreakdown.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No transaction data recorded yet.</p>
          ) : (
            report.paymentBreakdown.map((pm) => {
              const pct = Math.round((pm.total / totalPaymentRevenue) * 100);
              return (
                <div key={pm.method} className="progress-row">
                  <div className="progress-meta">
                    <span>
                      {pm.method} ({pm.count} tx)
                    </span>
                    <span className="tabular-nums">
                      {formatIDR(pm.total)} ({pct}%)
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="surface-card">
          <h3 style={{ fontSize: 15, marginBottom: 6 }}>Daily Sales Summary (Last 7 Days)</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Daily revenue trend across recent operating days
          </p>
          <div className="daily-bars">
            {report.dailySales.map((day) => {
              const heightPct = Math.round((day.total / maxDailySales) * 100);
              return (
                <div
                  key={day.date}
                  className="daily-bar-col"
                  title={`${day.date}: ${formatIDR(day.total)} (${day.count} tx)`}
                >
                  <div
                    className="daily-bar-fill"
                    style={{ height: `${Math.max(heightPct, day.total > 0 ? 8 : 3)}%` }}
                  />
                  <span className="daily-bar-label">{day.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="surface-card">
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Best-Selling Products</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Units Sold</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {report.bestSellingProducts.map((p) => (
                <tr key={p.product_id}>
                  <td style={{ fontWeight: 600 }}>{p.product_name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.sku}</td>
                  <td className="tabular-nums">{p.quantity}</td>
                  <td className="tabular-nums" style={{ fontWeight: 600 }}>
                    {formatIDR(p.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
