import React, { useState, useEffect } from 'react';
import { Banknote, QrCode, CreditCard, Wallet, CheckCircle2 } from 'lucide-react';
import Modal from './Modal.jsx';
import { formatIDR, parseNumericInput } from '../utils/currency.js';

const PAYMENT_METHODS = [
  { id: 'Cash', label: 'Cash', icon: Banknote },
  { id: 'QRIS', label: 'QRIS', icon: QrCode },
  { id: 'Debit', label: 'Debit', icon: CreditCard },
  { id: 'Credit', label: 'Credit', icon: CreditCard },
  { id: 'Other', label: 'Other', icon: Wallet }
];

export default function CheckoutModal({
  isOpen,
  onClose,
  summary,
  defaultMethod = 'Cash',
  onConfirmPayment
}) {
  const [paymentMethod, setPaymentMethod] = useState(defaultMethod);
  const [amountPaid, setAmountPaid] = useState(summary.grandTotal);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod(defaultMethod || 'Cash');
      setAmountPaid(summary.grandTotal);
    }
  }, [isOpen, defaultMethod, summary.grandTotal]);

  const isCash = paymentMethod === 'Cash';
  const changeAmount = isCash ? Math.max(0, amountPaid - summary.grandTotal) : 0;
  const isInsufficient = isCash && amountPaid < summary.grandTotal;

  const quickCashOptions = [
    summary.grandTotal,
    10000,
    20000,
    50000,
    100000,
    200000
  ].filter((v, idx, arr) => v >= summary.grandTotal && arr.indexOf(v) === idx);

  const handleMethodSelect = (method) => {
    setPaymentMethod(method);
    if (method !== 'Cash') {
      setAmountPaid(summary.grandTotal);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isInsufficient || submitting) return;
    setSubmitting(true);
    await onConfirmPayment({
      payment_method: paymentMethod,
      amount_paid: isCash ? amountPaid : summary.grandTotal
    });
    setSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout & Payment">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          className="surface-card"
          style={{ background: 'var(--bg-subtle)', display: 'flex', flexDirection: 'column', gap: 6 }}
        >
          <div className="summary-line">
            <span>Subtotal ({summary.totalItemsCount} items)</span>
            <span className="tabular-nums">{formatIDR(summary.rawSubtotal)}</span>
          </div>
          <div className="summary-line discount">
            <span>Total Discount</span>
            <span className="tabular-nums">-{formatIDR(summary.totalDiscount)}</span>
          </div>
          <div className="summary-total" style={{ paddingTop: 6 }}>
            <span>Total Payable</span>
            <span className="amount tabular-nums">{formatIDR(summary.grandTotal)}</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <div className="payment-methods-grid">
            {PAYMENT_METHODS.map((pm) => {
              const Icon = pm.icon;
              return (
                <button
                  key={pm.id}
                  type="button"
                  className={`payment-method-btn ${paymentMethod === pm.id ? 'active' : ''}`}
                  onClick={() => handleMethodSelect(pm.id)}
                >
                  <Icon size={17} />
                  <span>{pm.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            {isCash ? 'Cash Received (IDR)' : `${paymentMethod} Confirmed Amount (IDR)`}
          </label>
          <input
            type="text"
            className="input tabular-nums"
            style={{ height: 42, fontSize: 16, fontWeight: 700 }}
            value={formatIDR(amountPaid)}
            onChange={(e) => setAmountPaid(parseNumericInput(e.target.value))}
          />
        </div>

        {isCash && (
          <>
            <div className="quick-cash-grid">
              {quickCashOptions.slice(0, 6).map((val) => (
                <button
                  key={val}
                  type="button"
                  className="btn btn-secondary btn-sm tabular-nums"
                  onClick={() => setAmountPaid(val)}
                >
                  {val === summary.grandTotal ? `Exact (${formatIDR(val)})` : formatIDR(val)}
                </button>
              ))}
            </div>

            <div
              className="surface-card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: isInsufficient ? 'var(--danger-soft)' : 'var(--success-soft)',
                borderColor: 'transparent'
              }}
            >
              <span style={{ fontWeight: 600 }}>
                {isInsufficient ? 'Insufficient Cash' : 'Change Due'}
              </span>
              <span
                className="tabular-nums"
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: isInsufficient ? 'var(--danger)' : 'var(--success)'
                }}
              >
                {isInsufficient
                  ? `-${formatIDR(summary.grandTotal - amountPaid)}`
                  : formatIDR(changeAmount)}
              </span>
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isInsufficient || submitting}
          >
            <CheckCircle2 size={17} />
            <span>{submitting ? 'Processing...' : 'Complete Transaction'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
