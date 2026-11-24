# Kassa — Modern Retail POS System

Aplikasi Point of Sale (POS) web modern yang ringan dan responsif berbasis **React.js (JSX)**, **Vite**, **Modular CSS**, serta **Google Apps Script + Google Sheets** sebagai backend dan database cloud.

---

## 1. Struktur Proyek

```text
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── README.md
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles/
│   │   ├── global.css
│   │   └── print.css
│   ├── utils/
│   │   ├── currency.js
│   │   ├── calculations.js
│   │   ├── barcode.js
│   │   └── date.js
│   ├── services/
│   │   ├── googleAppsScript.js
│   │   └── api.js
│   ├── hooks/
│   │   ├── useProducts.js
│   │   └── useCart.js
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── SearchBar.jsx
│   │   ├── CategoryFilter.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── MemberSelector.jsx
│   │   ├── CartItem.jsx
│   │   ├── CartPanel.jsx
│   │   ├── CheckoutModal.jsx
│   │   ├── ReceiptPreview.jsx
│   │   ├── LoginModal.jsx
│   │   ├── Modal.jsx
│   │   └── Toast.jsx
│   └── pages/
│       ├── POSPage.jsx
│       ├── ProductsPage.jsx
│       ├── MembersPage.jsx
│       ├── TransactionsPage.jsx
│       ├── ReportsPage.jsx
│       └── SettingsPage.jsx
└── google-apps-script/
    ├── Config.gs
    ├── Utils.gs
    ├── Auth.gs
    ├── Products.gs
    ├── Members.gs
    ├── Transactions.gs
    ├── Reports.gs
    └── Code.gs
