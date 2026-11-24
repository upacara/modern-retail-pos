import React, { useState, useMemo, useCallback } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import CategoryFilter from '../components/CategoryFilter.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import CartPanel from '../components/CartPanel.jsx';
import CheckoutModal from '../components/CheckoutModal.jsx';
import ReceiptPreview from '../components/ReceiptPreview.jsx';
import Modal from '../components/Modal.jsx';
import { useBarcodeScanner } from '../utils/barcode.js';
import { api } from '../services/api.js';

export default function POSPage({
  products,
  categories,
  loadingProducts,
  globalSearch,
  onGlobalSearchChange,
  cart,
  members,
  onCreateMember,
  settings,
  user,
  notify,
  onTransactionSuccess,
  checkoutModalOpen,
  setCheckoutModalOpen,
  clearConfirmOpen,
  setClearConfirmOpen
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [completedReceipt, setCompletedReceipt] = useState(null);

  const visibleProducts = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    return products.filter((p) => {
      if (p.status !== 'active') return false;
      if (activeCategory !== 'All' && p.category !== activeCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q)
      );
    });
  }, [products, activeCategory, globalSearch]);

  const handleBarcodeLookup = useCallback(
    (code) => {
      const normalized = String(code || '').trim();
      if (!normalized) return;
      const found = products.find(
        (p) =>
          p.status === 'active' &&
          (p.barcode === normalized || p.sku.toLowerCase() === normalized.toLowerCase())
      );
      if (!found) {
        notify(`Barcode "${normalized}" not found.`, 'error');
        return;
      }
      const ok = cart.addItem(found);
      if (ok) {
        notify(`Added: ${found.name}`, 'success');
      }
    },
    [products, cart, notify]
  );

  useBarcodeScanner({
    onScan: handleBarcodeLookup,
    enabled: !checkoutModalOpen && !completedReceipt && !clearConfirmOpen
  });

  const handleConfirmPayment = async ({ payment_method, amount_paid }) => {
    const payload = {
      cashier: user?.name || 'Cashier',
      member_id: cart.selectedMember?.member_id || '',
      items: cart.items.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        discountType: item.discountType,
        discountValue: item.discountValue,
        discountReason: item.discountReason
      })),
      transactionDiscountType: cart.transactionDiscountType,
      transactionDiscountValue: cart.transactionDiscountValue,
      transactionDiscountReason: cart.transactionDiscountReason,
      payment_method,
      amount_paid
    };

    const res = await api.createTransaction(payload);
    if (!res.success) {
      notify(res.message || 'Transaction failed', 'error');
      return;
    }

    onTransactionSuccess(res.data);
    cart.clearCart();
    setCheckoutModalOpen(false);
    setCompletedReceipt(res.data);
    notify('Transaction completed!', 'success');
  };

  return (
    <div className="pos-workspace">
      <section className="pos-catalog-pane">
        <SearchBar
          searchQuery={globalSearch}
          onSearchChange={onGlobalSearchChange}
          onManualBarcodeSubmit={handleBarcodeLookup}
        />

        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        <ProductGrid
          products={visibleProducts}
          cartItems={cart.items}
          loading={loadingProducts}
          lowStockThreshold={Number(settings.low_stock_threshold) || 10}
          onAddProduct={(prod) => cart.addItem(prod)}
        />
      </section>

      <CartPanel
        summary={cart.summary}
        members={members}
        selectedMember={cart.selectedMember}
        onSelectMember={cart.setSelectedMember}
        onCreateMember={onCreateMember}
        transactionDiscountType={cart.transactionDiscountType}
        transactionDiscountValue={cart.transactionDiscountValue}
        transactionDiscountReason={cart.transactionDiscountReason}
        onSetTransactionDiscount={cart.setTransactionDiscount}
        onUpdateQty={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        onUpdateItemDiscount={cart.updateItemDiscount}
        onRequestClearCart={() => setClearConfirmOpen(true)}
        onOpenCheckout={() => setCheckoutModalOpen(true)}
        settings={settings}
        userRole={user?.role || 'cashier'}
      />

      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        summary={cart.summary}
        defaultMethod={settings.default_payment_method || 'Cash'}
        onConfirmPayment={handleConfirmPayment}
      />

      <ReceiptPreview
        isOpen={Boolean(completedReceipt)}
        onClose={() => setCompletedReceipt(null)}
        transaction={completedReceipt?.transaction}
        items={completedReceipt?.items || []}
        settings={settings}
        isNewSale
      />

      <Modal
        isOpen={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        title="Clear Current Cart"
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to remove all {cart.summary.totalItemsCount} items from the current
          transaction?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setClearConfirmOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              cart.clearCart();
              setClearConfirmOpen(false);
              notify('Cart cleared', 'info');
            }}
          >
            Clear Cart
          </button>
        </div>
      </Modal>
    </div>
  );
}
