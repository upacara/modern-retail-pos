import React, { useState } from 'react';
import { Printer, CheckCircle2 } from 'lucide-react';
import Modal from './Modal.jsx';
import { formatIDR } from '../utils/currency.js';
import { formatDateTime } from '../utils/date.js';

export default function ReceiptPreview({
  isOpen,
  onClose,
  transaction,
  items = [],
  settings = {},
  isNewSale = false
}) {
  const [paperWidth, setPaperWidth] = useState(settings.default_receipt_width || '80mm');

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isNewSale ? 'Transaction Completed' : 'Receipt Preview'}
    >
      {isNewSale && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--success-soft)',
            color: 'var(--success)',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={19} />
          <div>
            <div>Sale recorded successfully ({transaction.transaction_id})</div>
            {transaction.change_amount > 0 && (
              <div style={{ fontSize: 12.5 }}>
                Change Due: {formatIDR(transaction.change_amount)}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
          Thermal Paper Width:
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {['58mm', '80mm'].map((w) => (
            <button
              key={w}
              type="button"
              className={`btn btn-sm ${paperWidth === w ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPaperWidth(w)}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div className="receipt-preview-wrapper">
        <div
          id="printable-receipt"
          className={`thermal-receipt ${
            paperWidth === '58mm' ? 'receipt-58mm' : 'receipt-80mm'
          }`}
        >
          <div className="receipt-center">
            <div style={{ fontWeight: 700, fontSize: '1.15em' }}>
              {settings.store_name || 'NusaMart & Roastery'}
            </div>
            {settings.store_address && <div>{settings.store_address}</div>}
            {settings.store_phone && <div>Tel: {settings.store_phone}</div>}
          </div>

          <hr className="receipt-divider" />

          <div>
            <div className="receipt-row">
              <span>No:</span>
              <span>{transaction.transaction_id}</span>
            </div>
            <div className="receipt-row">
              <span>Date:</span>
              <span>{formatDateTime(transaction.date)}</span>
            </div>
            <div className="receipt-row">
              <span>Cashier:</span>
              <span>{transaction.cashier}</span>
            </div>
            {transaction.member_name && (
              <div className="receipt-row">
                <span>Member:</span>
                <span>{transaction.member_name}</span>
              </div>
            )}
          </div>

          <hr className="receipt-divider" />

          <div>
            {items.map((item, i) => (
              <div key={item.item_id || i} className="receipt-item-block">
                <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                <div className="receipt-row">
                  <span>
                    {item.quantity} x {formatIDR(item.price)}
                  </span>
                  <span>{formatIDR(item.line_total)}</span>
                </div>
                {Number(item.discount) > 0 && (
                  <div className="receipt-row" style={{ fontSize: '0.9em' }}>
                    <span> Item Disc</span>
                    <span>-{formatIDR(item.discount)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <hr className="receipt-divider" />

          <div className="receipt-row">
            <span>Subtotal</span>
            <span>{formatIDR(transaction.subtotal)}</span>
          </div>
          {Number(transaction.discount) > 0 && (
            <div className="receipt-row">
              <span>Discount</span>
              <span>-{formatIDR(transaction.discount)}</span>
            </div>
          )}
          <div className="receipt-row" style={{ fontWeight: 700, marginTop: 3 }}>
            <span>GRAND TOTAL</span>
            <span>{formatIDR(transaction.total)}</span>
          </div>

          <hr className="receipt-divider" />

          <div className="receipt-row">
            <span>Payment ({transaction.payment_method})</span>
            <span>{formatIDR(transaction.amount_paid)}</span>
          </div>
          {transaction.payment_method === 'Cash' && (
            <div className="receipt-row">
              <span>Change</span>
              <span>{formatIDR(transaction.change_amount)}</span>
            </div>
          )}
          {Number(transaction.points_earned) > 0 && (
            <div className="receipt-row">
              <span>Points Earned</span>
              <span>+{transaction.points_earned} pts</span>
            </div>
          )}

          <hr className="receipt-divider" />

          <div className="receipt-center" style={{ marginTop: 6 }}>
            {settings.receipt_footer || 'Terima kasih telah berbelanja!'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {isNewSale ? 'New Sale' : 'Close'}
        </button>
        <button type="button" className="btn btn-primary" onClick={handlePrint}>
          <Printer size={15} />
          Print Receipt
        </button>
      </div>
    </Modal>
  );
}
