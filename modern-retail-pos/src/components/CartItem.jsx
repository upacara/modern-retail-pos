import React, { useState } from 'react';
import { Minus, Plus, Trash2, Tag } from 'lucide-react';
import { formatIDR } from '../utils/currency.js';

export default function CartItem({
  item,
  canDiscount,
  onUpdateQty,
  onRemove,
  onUpdateDiscount
}) {
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [discType, setDiscType] = useState(item.discountType || 'none');
  const [discVal, setDiscVal] = useState(item.discountValue || '');
  const [discReason, setDiscReason] = useState(item.discountReason || '');

  const handleSaveDiscount = () => {
    onUpdateDiscount(item.product_id, {
      discountType: Number(discVal) > 0 ? discType : 'none',
      discountValue: Number(discVal) || 0,
      discountReason: discReason.trim()
    });
    setEditingDiscount(false);
  };

  return (
    <div className="cart-item-card">
      <div className="cart-item-top">
        <div>
          <div className="cart-item-name">{item.name}</div>
          <div className="cart-item-unit tabular-nums">
            {formatIDR(item.price)} / {item.unit || 'pcs'}
            {item.discountAmount > 0 && (
              <span style={{ color: 'var(--success)', marginLeft: 6, fontWeight: 600 }}>
                (-{formatIDR(item.discountAmount)})
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ padding: '0 6px', height: 24, color: 'var(--text-muted)' }}
          onClick={() => onRemove(item.product_id)}
          title="Remove item"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="cart-item-controls">
        <div className="qty-stepper">
          <button
            type="button"
            onClick={() => onUpdateQty(item.product_id, item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            <Minus size={13} />
          </button>
          <input
            type="number"
            min="1"
            max={item.stock}
            value={item.quantity}
            onChange={(e) => onUpdateQty(item.product_id, e.target.value)}
            aria-label="Item quantity"
          />
          <button
            type="button"
            onClick={() => onUpdateQty(item.product_id, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
            aria-label="Increase quantity"
          >
            <Plus size={13} />
          </button>
        </div>

        <div className="cart-item-right">
          {canDiscount && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ height: 26, padding: '0 7px', fontSize: 11.5 }}
              onClick={() => {
                if (discType === 'none') setDiscType('fixed');
                setEditingDiscount((prev) => !prev);
              }}
              title="Apply item discount"
            >
              <Tag size={12} />
              Disc
            </button>
          )}
          <span className="cart-line-total">{formatIDR(item.lineTotal)}</span>
        </div>
      </div>

      {editingDiscount && (
        <div className="item-discount-editor">
          <div className="item-discount-row">
            <select
              className="select"
              style={{ height: 28, width: 95, fontSize: 12 }}
              value={discType}
              onChange={(e) => setDiscType(e.target.value)}
            >
              <option value="fixed">Rp / unit</option>
              <option value="percent">% Off</option>
            </select>
            <input
              type="number"
              className="input"
              style={{ height: 28, fontSize: 12 }}
              min="0"
              max={discType === 'percent' ? 100 : item.price}
              value={discVal}
              onChange={(e) => setDiscVal(e.target.value)}
              placeholder="Amount"
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ height: 28 }}
              onClick={handleSaveDiscount}
            >
              Apply
            </button>
          </div>
          <input
            type="text"
            className="input"
            style={{ height: 26, fontSize: 11.5 }}
            value={discReason}
            onChange={(e) => setDiscReason(e.target.value)}
            placeholder="Optional discount reason (e.g. Near expiry)"
          />
        </div>
      )}
    </div>
  );
}
