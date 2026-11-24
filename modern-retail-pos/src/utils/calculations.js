/**
 * Computes item-level and transaction-level totals with strict non-negative bounds.
 */
export function calculateCartItem(item) {
  const price = Math.max(0, Math.round(Number(item.price) || 0));
  const quantity = Math.max(1, Math.round(Number(item.quantity) || 1));
  const grossTotal = price * quantity;

  const discountType = item.discountType || 'none';
  const discountValue = Math.max(0, Number(item.discountValue) || 0);

  let discountAmount = 0;
  if (discountType === 'fixed') {
    discountAmount = Math.round(discountValue) * quantity;
  } else if (discountType === 'percent') {
    const clampedPct = Math.min(100, discountValue);
    discountAmount = Math.round(grossTotal * (clampedPct / 100));
  }

  discountAmount = Math.min(grossTotal, Math.max(0, discountAmount));
  const lineTotal = grossTotal - discountAmount;

  return {
    ...item,
    price,
    quantity,
    grossTotal,
    discountAmount,
    lineTotal
  };
}

export function calculateCartSummary({
  items = [],
  transactionDiscountType = 'none',
  transactionDiscountValue = 0,
  member = null,
  settings = {}
}) {
  const computedItems = items.map(calculateCartItem);

  const rawSubtotal = computedItems.reduce((sum, item) => sum + item.grossTotal, 0);
  const itemDiscountTotal = computedItems.reduce((sum, item) => sum + item.discountAmount, 0);
  const subtotalAfterItemDiscounts = rawSubtotal - itemDiscountTotal;

  let txDiscountAmount = 0;
  const val = Math.max(0, Number(transactionDiscountValue) || 0);

  if (transactionDiscountType === 'fixed') {
    txDiscountAmount = Math.round(val);
  } else if (transactionDiscountType === 'percent') {
    const clampedPct = Math.min(100, val);
    txDiscountAmount = Math.round(subtotalAfterItemDiscounts * (clampedPct / 100));
  } else if (
    member &&
    settings.enable_discounts !== false &&
    Number(settings.member_discount_percent) > 0
  ) {
    const memberPct = Math.min(100, Number(settings.member_discount_percent));
    txDiscountAmount = Math.round(subtotalAfterItemDiscounts * (memberPct / 100));
  }

  txDiscountAmount = Math.min(subtotalAfterItemDiscounts, Math.max(0, txDiscountAmount));

  const totalDiscount = itemDiscountTotal + txDiscountAmount;
  const grandTotal = Math.max(0, subtotalAfterItemDiscounts - txDiscountAmount);
  const totalItemsCount = computedItems.reduce((sum, item) => sum + item.quantity, 0);

  const pointsRate = Math.max(1000, Number(settings.points_earn_rate) || 10000);
  const estimatedPoints =
    member && settings.enable_member_points !== false
      ? Math.floor(grandTotal / pointsRate)
      : 0;

  return {
    items: computedItems,
    totalItemsCount,
    rawSubtotal,
    itemDiscountTotal,
    subtotalAfterItemDiscounts,
    transactionDiscountAmount: txDiscountAmount,
    totalDiscount,
    grandTotal,
    estimatedPoints
  };
}
