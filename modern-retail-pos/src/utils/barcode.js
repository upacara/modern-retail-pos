import { useEffect, useRef } from 'react';

/**
 * Listens for rapid USB HID keyboard-emulated barcode scanner input ending with Enter.
 */
export function useBarcodeScanner({ onScan, enabled = true, maxIntervalMs = 55, minLength = 4 }) {
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  useEffect(() => {
    if (!enabled) return undefined;

    const handleKeyDown = (event) => {
      const target = event.target;
      const tagName = target?.tagName?.toLowerCase();
      const isFormField =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target?.isContentEditable;

      // Let manual barcode input field handle its own Enter submission
      if (isFormField && target?.dataset?.barcodeInput !== 'true') {
        return;
      }
      if (target?.dataset?.barcodeInput === 'true') {
        return;
      }

      const now = Date.now();
      const elapsed = now - lastKeyTimeRef.current;

      if (event.key === 'Enter') {
        if (bufferRef.current.length >= minLength && elapsed <= maxIntervalMs * 2) {
          event.preventDefault();
          const scannedCode = bufferRef.current.trim();
          bufferRef.current = '';
          onScan(scannedCode);
        } else {
          bufferRef.current = '';
        }
        return;
      }

      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        if (elapsed > maxIntervalMs) {
          bufferRef.current = event.key;
        } else {
          bufferRef.current += event.key;
        }
        lastKeyTimeRef.current = now;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onScan, enabled, maxIntervalMs, minLength]);
}
