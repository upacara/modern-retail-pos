import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import Modal from '../components/Modal.jsx';
import { formatIDR } from '../utils/currency.js';

const EMPTY_PRODUCT = {
  name: '',
  sku: '',
  barcode: '',
  category: 'Beverages',
  price: 0,
  cost_price: 0,
  stock: 0,
  unit: 'pcs',
  image_url: '',
  status: 'active'
};

export default function ProductsPage({
  products,
  categories,
  lowStockThreshold = 10,
  onAddProduct,
  onEditProduct,
  onChangeStock,
  onDeleteProduct,
  userRole
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PRODUCT);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Inline quick price / stock edit state
  const [inlineEdit, setInlineEdit] = useState(null); // { id, field: 'price' | 'stock', value }

  const isAdmin = userRole === 'admin';

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => {
        if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'stock_asc') return a.stock - b.stock;
        return a.name.localeCompare(b.name);
      });
  }, [products, search, categoryFilter, sortBy]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(EMPTY_PRODUCT);
    setFormModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const res = editingProduct
      ? await onEditProduct({ ...formData, product_id: editingProduct.product_id })
      : await onAddProduct(formData);
    if (res.success) {
      setFormModalOpen(false);
    }
  };

  const commitInlineEdit = async () => {
    if (!inlineEdit) return;
    const { id, field, value } = inlineEdit;
    const num = Math.max(0, Math.round(Number(value) || 0));
    if (field === 'stock') {
      await onChangeStock(id, num);
    } else if (field === 'price') {
      await onEditProduct({ product_id: id, price: num });
    }
    setInlineEdit(null);
  };

  return (
    <div className="page-scroll-container">
      <div className="page-header">
        <div className="page-title">
          <h2>Product Catalog & Inventory</h2>
          <p>Manage retail items, barcodes, quick pricing, and stock availability.</p>
        </div>
        {isAdmin && (
          <button type="button" className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} />
            Add Product
          </button>
        )}
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="input"
          style={{ maxWidth: 290 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, SKU, or barcode..."
        />
        <select
          className="select"
          style={{ width: 170 }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All Categories' : c}
            </option>
          ))}
        </select>
        <select
          className="select"
          style={{ width: 175 }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort: Name (A–Z)</option>
          <option value="price_asc">Sort: Price Low–High</option>
          <option value="price_desc">Sort: Price High–Low</option>
          <option value="stock_asc">Sort: Lowest Stock</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU / Barcode</th>
              <th>Category</th>
              <th>Selling Price</th>
              <th>Cost</th>
              <th>Stock</th>
              <th>Status</th>
              {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const isLow = p.stock > 0 && p.stock <= lowStockThreshold;
              const isOut = p.stock <= 0;
              const editingPrice =
                inlineEdit?.id === p.product_id && inlineEdit?.field === 'price';
              const editingStock =
                inlineEdit?.id === p.product_id && inlineEdit?.field === 'stock';

              return (
                <tr key={p.product_id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Unit: {p.unit || 'pcs'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.sku}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                      {p.barcode || '—'}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{p.category}</span>
                  </td>
                  <td className="tabular-nums">
                    {editingPrice ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input
                          type="number"
                          className="input"
                          style={{ width: 95, height: 28 }}
                          autoFocus
                          value={inlineEdit.value}
                          onChange={(e) =>
                            setInlineEdit({ ...inlineEdit, value: e.target.value })
                          }
                          onKeyDown={(e) => e.key === 'Enter' && commitInlineEdit()}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0 6px', height: 28 }}
                          onClick={commitInlineEdit}
                        >
                          <Check size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0 6px', height: 28 }}
                          onClick={() => setInlineEdit(null)}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm tabular-nums"
                        style={{ padding: '0 6px', fontWeight: 700, color: 'var(--accent-primary)' }}
                        disabled={!isAdmin}
                        title={isAdmin ? 'Click for quick price edit' : ''}
                        onClick={() =>
                          setInlineEdit({ id: p.product_id, field: 'price', value: p.price })
                        }
                      >
                        {formatIDR(p.price)}
                      </button>
                    )}
                  </td>
                  <td className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {formatIDR(p.cost_price)}
                  </td>
                  <td className="tabular-nums">
                    {editingStock ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input
                          type="number"
                          className="input"
                          style={{ width: 72, height: 28 }}
                          autoFocus
                          value={inlineEdit.value}
                          onChange={(e) =>
                            setInlineEdit({ ...inlineEdit, value: e.target.value })
                          }
                          onKeyDown={(e) => e.key === 'Enter' && commitInlineEdit()}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0 6px', height: 28 }}
                          onClick={commitInlineEdit}
                        >
                          <Check size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm tabular-nums"
                        style={{ padding: '0 6px' }}
                        disabled={!isAdmin}
                        title={isAdmin ? 'Click for quick stock edit' : ''}
                        onClick={() =>
                          setInlineEdit({ id: p.product_id, field: 'stock', value: p.stock })
                        }
                      >
                        <span
                          className={`badge ${
                            isOut ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-success'
                          }`}
                        >
                          {isLow && <AlertTriangle size={11} style={{ marginRight: 4 }} />}
                          {p.stock}
                        </span>
                      </button>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`badge ${
                        p.status === 'active' ? 'badge-success' : 'badge-neutral'
                      }`}
                      style={{ border: 'none', cursor: isAdmin ? 'pointer' : 'default' }}
                      disabled={!isAdmin}
                      onClick={() =>
                        onEditProduct({
                          product_id: p.product_id,
                          status: p.status === 'active' ? 'inactive' : 'active'
                        })
                      }
                    >
                      {p.status}
                    </button>
                  </td>
                  {isAdmin && (
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEditModal(p)}
                        title="Edit product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => setDeleteTarget(p)}
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              className="input"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input
                className="input"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Barcode</label>
              <input
                className="input"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <input
                className="input"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <input
                className="input"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="pcs, bottle, pack, kg"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Selling Price (IDR) *</label>
              <input
                type="number"
                className="input"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cost Price (IDR)</label>
              <input
                type="number"
                className="input"
                min="0"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
              <input
                type="number"
                className="input"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Product Image URL (Optional)</label>
            <input
              type="url"
              className="input"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setFormModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.sku})? This action cannot be
          undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setDeleteTarget(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={async () => {
              await onDeleteProduct(deleteTarget.product_id);
              setDeleteTarget(null);
            }}
          >
            Delete Product
          </button>
        </div>
      </Modal>
    </div>
  );
}
