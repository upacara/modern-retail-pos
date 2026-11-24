import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import ToastContainer from './components/Toast.jsx';
import Modal from './components/Modal.jsx';
import POSPage from './pages/POSPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import MembersPage from './pages/MembersPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { useProducts } from './hooks/useProducts.js';
import { useCart } from './hooks/useCart.js';
import { api, getApiConfig } from './services/api.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [globalSearch, setGlobalSearch] = useState('');
  const [toasts, setToasts] = useState([]);
  const [settings, setSettings] = useState({});
  const [members, setMembers] = useState([]);
  const [user, setUser] = useState({
    user_id: 'USR-001',
    name: 'Alya Pratama',
    username: 'admin',
    role: 'admin'
  });

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const searchInputRef = useRef(null);

  const notify = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const {
    products,
    categories,
    loading: loadingProducts,
    refreshProducts,
    addProduct,
    editProduct,
    changeStock,
    removeProduct,
    applyLocalStockDeduction
  } = useProducts(notify);

  const cart = useCart(settings, notify);

  const loadBootstrapData = useCallback(async () => {
    const [settingsRes, membersRes] = await Promise.all([
      api.getSettings(),
      api.getMembers()
    ]);
    if (settingsRes.success && settingsRes.data) setSettings(settingsRes.data);
    if (membersRes.success && Array.isArray(membersRes.data)) setMembers(membersRes.data);
  }, []);

  useEffect(() => {
    loadBootstrapData();
  }, [loadBootstrapData]);

  // Global Keyboard Shortcuts (F2 Search, F4 Pay, F8 Clear Cart, Escape Close Modals)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select';

      if (e.key === 'Escape') {
        setCheckoutModalOpen(false);
        setClearConfirmOpen(false);
        setUserModalOpen(false);
        return;
      }

      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('pos');
        setTimeout(() => searchInputRef.current?.focus(), 20);
        return;
      }

      if (isTyping) return;

      if (e.key === 'F4' && activeTab === 'pos' && cart.items.length > 0) {
        e.preventDefault();
        setCheckoutModalOpen(true);
      } else if (e.key === 'F8' && activeTab === 'pos' && cart.items.length > 0) {
        e.preventDefault();
        setClearConfirmOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, cart.items.length]);

  const handleCreateMember = async (memberData) => {
    const res = await api.createMember(memberData);
    if (res.success && res.data) {
      setMembers((prev) => [res.data, ...prev]);
      notify('Member registered', 'success');
    } else {
      notify(res.message || 'Could not register member', 'error');
    }
    return res;
  };

  const handleUpdateMember = async (memberData) => {
    const res = await api.updateMember(memberData);
    if (res.success && res.data) {
      setMembers((prev) =>
        prev.map((m) => (m.member_id === res.data.member_id ? res.data : m))
      );
      notify('Member updated', 'success');
    } else {
      notify(res.message || 'Could not update member', 'error');
    }
    return res;
  };

  const handleSaveSettings = async (newSettings) => {
    const res = await api.updateSettings(newSettings);
    if (res.success && res.data) {
      setSettings(res.data);
      notify('Settings saved', 'success');
    } else {
      notify(res.message || 'Could not save settings', 'error');
    }
  };

  const handleTransactionSuccess = (txData) => {
    if (txData?.items) {
      applyLocalStockDeduction(txData.items);
    }
    if (txData?.member) {
      setMembers((prev) =>
        prev.map((m) => (m.member_id === txData.member.member_id ? txData.member : m))
      );
    }
  };

  const handleSwitchUser = async (e) => {
    e.preventDefault();
    const res = await api.authenticateUser(loginForm);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      setLoginForm({ username: '', password: '' });
      setUserModalOpen(false);
      notify(`Signed in as ${res.data.user.name} (${res.data.user.role})`, 'success');
    } else {
      notify(res.message || 'Authentication failed', 'error');
    }
  };

  const apiConfig = getApiConfig();

  return (
    <div className="app-shell">
      <Header
        storeName={settings.store_name}
        user={user}
        apiMode={apiConfig.mode}
        globalSearch={globalSearch}
        onGlobalSearchChange={(val) => {
          setGlobalSearch(val);
          if (activeTab !== 'pos') setActiveTab('pos');
        }}
        searchInputRef={searchInputRef}
        onOpenUserModal={() => setUserModalOpen(true)}
        onNavigateSettings={() => setActiveTab('settings')}
      />

      <div className="app-body">
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        <main className="app-main">
          {activeTab === 'pos' && (
            <POSPage
              products={products}
              categories={categories}
              loadingProducts={loadingProducts}
              globalSearch={globalSearch}
              onGlobalSearchChange={setGlobalSearch}
              cart={cart}
              members={members}
              onCreateMember={handleCreateMember}
              settings={settings}
              user={user}
              notify={notify}
              onTransactionSuccess={handleTransactionSuccess}
              checkoutModalOpen={checkoutModalOpen}
              setCheckoutModalOpen={setCheckoutModalOpen}
              clearConfirmOpen={clearConfirmOpen}
              setClearConfirmOpen={setClearConfirmOpen}
            />
          )}

          {activeTab === 'products' && (
            <ProductsPage
              products={products}
              categories={categories}
              lowStockThreshold={Number(settings.low_stock_threshold) || 10}
              onAddProduct={addProduct}
              onEditProduct={editProduct}
              onChangeStock={changeStock}
              onDeleteProduct={removeProduct}
              userRole={user?.role}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPage settings={settings} notify={notify} />
          )}

          {activeTab === 'members' && (
            <MembersPage
              members={members}
              onCreateMember={handleCreateMember}
              onUpdateMember={handleUpdateMember}
            />
          )}

          {activeTab === 'reports' && <ReportsPage notify={notify} />}

          {activeTab === 'settings' && (
            <SettingsPage
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onRefreshAll={async () => {
                await Promise.all([refreshProducts(), loadBootstrapData()]);
              }}
              notify={notify}
              userRole={user?.role}
            />
          )}
        </main>
      </div>

      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title="Cashier & Admin Sign In"
      >
        <form onSubmit={handleSwitchUser} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
            Default dev accounts: <code>admin / admin123</code> (Full access) or{' '}
            <code>kasir1 / kasir123</code> (Cashier role).
          </p>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="input"
              required
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="input"
              required
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
