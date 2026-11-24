import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Printer, RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';
import { formatIDR } from '../utils/currency.js';
import { formatDateTime } from '../utils/date.js';
import Modal from '../components/Modal.jsx';
import ReceiptPreview from '../components/ReceiptPreview.jsx';

const PAGE_SIZE = 12;

export default function TransactionsPage({ settings, notify }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);

  const [detailData, setDetailData] = useState(null);
  const [reprintData, setReprintData] = useState(null);

  const loadTransactions = async () => {
    setLoading(true);
    const res = await api.getTransactions();
    if (res.success && Array.isArray(res.data)) {
      setTransactions(res.data);
    } else {
      notify?.(res.message || 'Failed to load transactions', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (paymentFilter !== 'All' && t.payment_method !== paymentFilter) return false;
      if (dateFilter && !String(t.date || '').startsWith(dateFilter)) return false;
      if (!q) return true;
      return (
        String(t.transaction_id).toLowerCase().includes(q) ||
        String(t.cashier).toLowerCase().includes(q) ||
        String(t.member_name || '').toLowerCase().includes(q)
      );
    });
  }, [transactions, search, paymentFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleOpenDetails = async (tx, openAsReceipt = false) => {
    const res = await api.getTransactionDetails(tx.transaction_id);
    if (!res.success) {
      notify?.(res.message || 'Could not load receipt items', 'error');
      return;
    }
    if (openAsReceipt) {
      setReprintData(res.data);
    } else {
      setDetailData(res.data);
    }
  };

  return (
    <div className="page-scroll-container">
      <div className="page-header">
        <div className="page-title">
          <h2>Transaction History</h2>
          <p>Audit completed sales, inspect discount breakdowns, and reprint thermal receipts.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={loadTransactions}>
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="input"
          style={{ maxWidth: 270 }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search Transaction ID or Cashier..."
        />
        <input
          type="date"
          className="input"
          style={{ width: 165 }}
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="select"
          style={{ width: 160 }}
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="All">All Payments</option>
          <option value="Cash">Cash</option>
          <option value="QRIS">QRIS</option>
          <option value="Debit">Debit</option>
          <option value="Credit">Credit</option>
          <option value="Other">Other</option>
        </select>
        {dateFilter && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setDateFilter('')}
          >
            Clear Date
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date & Time</th>
              <th>Cashier</th>
              <th>Member</th>
              <th>Payment</th>
              <th>Discount</th>
              <th>Total</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: 24 }}>
                  Loading transactions...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  No transactions match your filters.
                </td>
              </tr>
            ) : (
              paginated.map((t) => (
                <tr key={t.transaction_id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12 }}>
                    {t.transaction_id}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDateTime(t.date)}</td>
                  <td>{t.cashier}</td>
                  <td>{t.member_name || '—'}</td>
                  <td>
                    <span className="badge badge-neutral">{t.payment_method}</span>
                  </td>
                  <td className="tabular-nums" style={{ color: 'var(--success)' }}>
                    {Number(t.discount) > 0 ? `-${formatIDR(t.discount)}` : '—'}
                  </td>
                  <td className="tabular-nums" style={{ fontWeight: 700 }}>
                    {formatIDR(t.total)}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleOpenDetails(t, false)}
                      title="View items"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleOpenDetails(t, true)}
                      title="Reprint receipt"
                    >
                      <Printer size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages} ({filtered.length} transactions)
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={Boolean(detailData)}
        onClose={() => setDetailData(null)}
        title={`Transaction ${detailData?.transaction?.transaction_id || ''}`}
        size="lg"
      >
        {detailData && (
          <>
            <div className="form-grid-2" style={{ fontSize: 13 }}>
              <div>
                <strong>Date:</strong> {formatDateTime(detailData.transaction.date)}
              </div>
              <div>
                <strong>Cashier:</strong> {detailData.transaction.cashier}
              </div>
              <div>
                <strong>Payment:</strong> {detailData.transaction.payment_method}
              </div>
              <div>
                <strong>Member:</strong> {detailData.transaction.member_name || 'Walk-in'}
              </div>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detailData.items.map((item) => (
                    <tr key={item.item_id}>
                      <td>{item.product_name}</td>
                      <td className="tabular-nums">{item.quantity}</td>
                      <td className="tabular-nums">{formatIDR(item.price)}</td>
                      <td className="tabular-nums">{formatIDR(item.discount)}</td>
                      <td className="tabular-nums" style={{ fontWeight: 600 }}>
                        {formatIDR(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Grand Total: </strong>
                <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {formatIDR(detailData.transaction.total)}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const data = detailData;
                  setDetailData(null);
                  setReprintData(data);
                }}
              >
                <Printer size={15} />
                Open Receipt Preview
              </button>
            </div>
          </>
        )}
      </Modal>

      <ReceiptPreview
        isOpen={Boolean(reprintData)}
        onClose={() => setReprintData(null)}
        transaction={reprintData?.transaction}
        items={reprintData?.items || []}
        settings={settings}
      />
    </div>
  );
}
