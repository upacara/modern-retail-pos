import React from 'react';
import {
  ShoppingBag,
  Package,
  ReceiptText,
  Users,
  BarChart3,
  Settings
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'pos', label: 'Kasir', icon: ShoppingBag },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'transactions', label: 'History', icon: ReceiptText },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export default function Sidebar({ activeTab, onSelectTab }) {
  return (
    <nav className="app-sidebar" aria-label="Main Navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(item.id)}
          >
            <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
