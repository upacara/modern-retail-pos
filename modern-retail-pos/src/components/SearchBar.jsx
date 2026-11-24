import React, { useState } from 'react';
import { Search, Barcode, X } from 'lucide-react';

export default function SearchBar({
  searchQuery,
  onSearchChange,
  onManualBarcodeSubmit
}) {
  const [manualBarcode, setManualBarcode] = useState('');

  const handleBarcodeKeyDown = (e) => {
    if (e.key === 'Enter' && manualBarcode.trim()) {
      e.preventDefault();
      onManualBarcodeSubmit(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  return (
    <div className="pos-toolbar">
      <div className="pos-search-box">
        <Search size={16} className="icon-left" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter catalog by name or SKU..."
        />
        {searchQuery && (
          <button
            type="button"
            className="clear-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="barcode-input-box">
        <Barcode size={16} className="icon-left" />
        <input
          type="text"
          data-barcode-input="true"
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
          onKeyDown={handleBarcodeKeyDown}
          placeholder="Scan or enter barcode + Enter"
          aria-label="Manual barcode input"
        />
      </div>
    </div>
  );
}
