import React from 'react';
import { Package } from 'lucide-react';
import { formatIDR } from '../utils/currency.js';

export default function ProductCard({
  product,
  inCartQty = 0,
  lowStockThreshold = 10,
  onSelect
}) {
  const isOut = product.stock <= 0;
  const isLow = !isOut && product.stock <= lowStockThreshold;

  return (
    <button
      type="button"
      className={`product-card ${isOut ? 'out-of-stock' : ''} ${inCartQty > 0 ? 'in-cart' : ''}`}
      onClick={() => !isOut && onSelect(product)}
      disabled={isOut}
    >
      {inCartQty > 0 && <span className="product-cart-badge">{inCartQty}</span>}

      <div className="product-thumb">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" />
        ) : (
          <Package size={26} strokeWidth={1.5} />
        )}
      </div>

      <div>
        <div className="product-meta-top">
          <span className="product-sku">{product.sku}</span>
          <span className={`stock-pill ${isOut ? 'empty' : isLow ? 'low' : 'ok'}`}>
            {isOut ? 'Out' : `${product.stock} ${product.unit || 'pcs'}`}
          </span>
        </div>
        <div className="product-title" style={{ marginTop: 5 }}>
          {product.name}
        </div>
      </div>

      <div className="product-price">{formatIDR(product.price)}</div>
    </button>
  );
}
