import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api.js';

export function useProducts(notify) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await api.getProducts();
    if (res.success && Array.isArray(res.data)) {
      setProducts(res.data);
    } else {
      setError(res.message || 'Failed to load products');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const categories = useMemo(() => {
    const set = new Set(['All']);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const addProduct = async (payload) => {
    const res = await api.createProduct(payload);
    if (res.success) {
      setProducts((prev) => [res.data, ...prev]);
      notify?.('Product added successfully', 'success');
    } else {
      notify?.(res.message, 'error');
    }
    return res;
  };

  const editProduct = async (payload) => {
    const res = await api.updateProduct(payload);
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.product_id === res.data.product_id ? res.data : p))
      );
      notify?.('Product updated', 'success');
    } else {
      notify?.(res.message, 'error');
    }
    return res;
  };

  const changeStock = async (product_id, stock) => {
    const res = await api.updateStock({ product_id, stock });
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.product_id === product_id ? res.data : p))
      );
      notify?.('Stock updated', 'success');
    } else {
      notify?.(res.message, 'error');
    }
    return res;
  };

  const removeProduct = async (product_id) => {
    const res = await api.deleteProduct(product_id);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.product_id !== product_id));
      notify?.('Product deleted', 'success');
    } else {
      notify?.(res.message, 'error');
    }
    return res;
  };

  const applyLocalStockDeduction = useCallback((soldItems) => {
    setProducts((prev) =>
      prev.map((prod) => {
        const match = soldItems.find((i) => i.product_id === prod.product_id);
        if (!match) return prod;
        return {
          ...prod,
          stock: Math.max(0, prod.stock - match.quantity)
        };
      })
    );
  }, []);

  return {
    products,
    categories,
    loading,
    error,
    refreshProducts,
    addProduct,
    editProduct,
    changeStock,
    removeProduct,
    applyLocalStockDeduction
  };
}
