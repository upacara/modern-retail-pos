import React from 'react';
import { X } from 'lucide-react';

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item ${t.type || 'info'}`}>
          <span>{t.message}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ padding: '0 4px', height: 22 }}
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
