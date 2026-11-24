import { useState, useMemo, useCallback } from 'react';
import { calculateCartSummary } from '../utils/calculations.js';

export function useCart(settings, notify) {
  const [items, setItems] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [transactionDiscountType, setTransactionDiscountType] = useState('none');
  const [transactionDiscountValue, setTransactionDiscountValue] = useState(0);
  const [transactionDiscountReason, setTransactionDiscountReason] = useState('');

  const addItem = useCallback(
    (product) => {
      if (!product || product.status !== 'active') {
        notify?.('This product is inactive.', 'warning');
        return false;
      }
      if (product.stock <= 0) {
        notify?.(`${product.name} is out of stock.`, 'error');
        return false;
      }

      let added = true;
      setItems((prev) => {
        const existingIdx = prev.findIndex((i) => i.product_id === product.product_id);
        if (existingIdx > -1) {
          const existing = prev[existingIdx];
          if (existing.quantity + 1 > product.stock) {
            notify?.(`Maximum stock reached for ${product.name} (${product.stock}).`, 'warning');
            added = false;
            return prev;
          }
          const copy = [...prev];
          copy[existingIdx] = {
            ...existing,
            price: product.price,
            stock: product.stock,
            quantity: existing.quantity + 1
          };
          return copy;
        }
        return [
          ...prev,
          {
            product_id: product.product_id,
            name: product.name,
            sku: product.sku,
            unit: product.unit,
            price: product.price,
            stock: product.stock,
            quantity: 1,
            discountType: 'none',
            discountValue: 0,
            discountReason: ''
          }
        ];
      });
      return added;
    },
    [notify]
  );

  const updateQuantity = useCallback(
    (product_id, nextQty) => {
      const qty = Math.round(Number(nextQty) || 0);
      if (qty <= 0) {
        setItems((prev) => prev.filter((i) => i.product_id !== product_id));
        return;
      }
      setItems((prev) =>
        prev.map((item) => {
          if (item.product_id !== product_id) return item;
          if (qty > item.stock) {
            notify?.(`Only ${item.stock} units available in stock.`, 'warning');
            return { ...item, quantity: item.stock };
          }
          return { ...item, quantity: qty };
        })
      );
    },
    [notify]
  );

  const removeItem = useCallback((product_id) => {
    setItems((prev) => prev.filter((i) => i.product_id !== product_id));
  }, []);

  const updateItemDiscount = useCallback(
    (product_id, { discountType, discountValue, discountReason }) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.product_id !== product_id) return item;
          return {
            ...item,
            discountType: discountType || 'none',
            discountValue: Math.max(0, Number(discountValue) || 0),
            discountReason: discountReason || ''
          };
        })
      );
    },
    []
  );

  const setTransactionDiscount = useCallback(({ type, value, reason }) => {
    setTransactionDiscountType(type || 'none');
    setTransactionDiscountValue(Math.max(0, Number(value) || 0));
    setTransactionDiscountReason(reason || '');
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setSelectedMember(null);
    setTransactionDiscountType('none');
    setTransactionDiscountValue(0);
    setTransactionDiscountReason('');
  }, []);

  const summary = useMemo(
    () =>
      calculateCartSummary({
        items,
        transactionDiscountType,
        transactionDiscountValue,
        member: selectedMember,
        settings
      }),
    [items, transactionDiscountType, transactionDiscountValue, selectedMember, settings]
  );

  return {
    items,
    selectedMember,
    setSelectedMember,
    transactionDiscountType,
    transactionDiscountValue,
    transactionDiscountReason,
    setTransactionDiscount,
    addItem,
    updateQuantity,
    removeItem,
    updateItemDiscount,
    clearCart,
    summary
  };
}
