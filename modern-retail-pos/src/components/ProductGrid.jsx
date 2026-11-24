import React from 'react';
import { PackageSearch } from 'lucide-react';
import ProductCard from './ProductCard.jsx';

export default function ProductGrid({
  products,
  cartItems,
  loading,
  lowStockThreshold,
  onAddProduct
}) {
  if (loading) {
    return (
      <div className="product-grid-scroll">
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="product-grid-scroll">
        <div className="empty-state">
          <PackageSearch size={36} strokeWidth={1.5} />
          <strong>No matching products found</strong>
          <span>Try clearing the search query or selecting another category.</span>
        </div>
      </div>
    );
  }

  const cartQtyMap = {};
  cartItems.forEach((item) => {
    cartQtyMap[item.product_id] = item.quantity;
  });

  return (
    <div className="product-grid-scroll">
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.product_id}
            product={product}
            inCartQty={cartQtyMap[product.product_id] || 0}
            lowStockThreshold={lowStockThreshold}
            onSelect={onAddProduct}
          />
        ))}
      </div>
    </div>
  );
}
