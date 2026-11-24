import React, { useState } from 'react';
import { ShoppingCart, Trash2, Percent, ArrowRight } from 'lucide-react';
import MemberSelector from './MemberSelector.jsx';
import CartItem from './CartItem.jsx';
import { formatIDR } from '../utils/currency.js';

export default function CartPanel({
  summary,
  members,
  selectedMember,
  onSelectMember,
  onCreateMember,
  transactionDiscountType,
  transactionDiscountValue,
  transactionDiscountReason,
  onSetTransactionDiscount,
  onUpdateQty,
  onRemoveItem,
  onUpdateItemDiscount,
  onRequestClearCart,
  onOpenCheckout,
  settings,
  userRole
}) {
  const [showTxDiscount, setShowTxDiscount] = useState(false);
  const [txType, setTxType] = useState(
    transactionDiscountType === 'none' ? 'fixed' : transactionDiscountType
  );
  const [txVal, setTxVal] = useState(transactionDiscountValue || '');
  const [txReason, setTxReason] = useState(transactionDiscountReason || '');

  const canDiscount =
    settings.enable_discounts !== false && (userRole === 'admin' || userRole === 'cashier');

  const handleApplyTxDiscount = () => {
    onSetTransactionDiscount({
      type: Number(txVal) > 0 ? txType : 'none',
      value: Number(txVal) || 0,
      reason: txReason.trim()
    });
    setShowTxDiscount(false);
  };

  return (
    <aside className="cart-panel" aria-label="Current Transaction Cart">
      <div className="cart-header">
        <div className="cart-header-title">
          <ShoppingCart size={17} color="var(--accent-primary)" />
          <span>Current Order</span>
          <span className="cart-count-pill">{summary.totalItemsCount}</span>
        </div>

        {summary.items.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--danger)' }}
            onClick={onRequestClearCart}
            title="Clear cart (F8)"
          >
            <Trash2 size={14} />
            Clear
          </button>
        )}
      </div>

      <MemberSelector
        members={members}
        selectedMember={selectedMember}
        onSelectMember={onSelectMember}
        onCreateMember={onCreateMember}
        enablePoints={settings.enable_member_points !== false}
      />

      <div className="cart-items-scroll">
        {summary.items.length === 0 ? (
          <div className="empty-state" style={{ margin: 'auto 0' }}>
            <ShoppingCart size={34} strokeWidth={1.4} />
            <strong>Cart is empty</strong>
            <span>Click a product card or scan a barcode to start a sale.</span>
          </div>
        ) : (
          summary.items.map((item) => (
            <CartItem
              key={item.product_id}
              item={item}
              canDiscount={canDiscount}
              onUpdateQty={onUpdateQty}
              onRemove={onRemoveItem}
              onUpdateDiscount={onUpdateItemDiscount}
            />
          ))
        )}
      </div>

      <div className="cart-footer">
        <div className="summary-line">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatIDR(summary.rawSubtotal)}</span>
        </div>

        <div className="summary-line discount">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Discount
            {canDiscount && summary.items.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ height: 22, padding: '0 7px', fontSize: 11 }}
                onClick={() => setShowTxDiscount((prev) => !prev)}
              >
                <Percent size={11} />
                Order Disc
              </button>
            )}
          </span>
          <span className="tabular-nums">-{formatIDR(summary.totalDiscount)}</span>
        </div>

        {showTxDiscount && (
          <div className="item-discount-editor">
            <div className="item-discount-row">
              <select
                className="select"
                style={{ height: 28, width: 90, fontSize: 12 }}
                value={txType}
                onChange={(e) => setTxType(e.target.value)}
              >
                <option value="fixed">Rp Fixed</option>
                <option value="percent">% Off</option>
              </select>
              <input
                type="number"
                className="input"
                style={{ height: 28, fontSize: 12 }}
                min="0"
                max={txType === 'percent' ? 100 : summary.subtotalAfterItemDiscounts}
                value={txVal}
                onChange={(e) => setTxVal(e.target.value)}
                placeholder="Order discount"
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ height: 28 }}
                onClick={handleApplyTxDiscount}
              >
                Apply
              </button>
            </div>
            <input
              type="text"
              className="input"
              style={{ height: 26, fontSize: 11.5 }}
              value={txReason}
              onChange={(e) => setTxReason(e.target.value)}
              placeholder="Discount reason (e.g. Promo Weekend)"
            />
          </div>
        )}

        {selectedMember && summary.estimatedPoints > 0 && (
          <div className="summary-line" style={{ fontSize: 12, color: 'var(--accent-primary)' }}>
            <span>Loyalty Points Earned</span>
            <span>+{summary.estimatedPoints} pts</span>
          </div>
        )}

        <div className="summary-total">
          <span>Grand Total</span>
          <span className="amount tabular-nums">{formatIDR(summary.grandTotal)}</span>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: 4 }}
          disabled={summary.items.length === 0}
          onClick={onOpenCheckout}
        >
          <span>Proceed to Payment (F4)</span>
          <ArrowRight size={17} />
        </button>
      </div>
    </aside>
  );
}
