import { callAppsScript } from './googleAppsScript.js';
import { calculateCartSummary } from '../utils/calculations.js';
import { getTodayISODate } from '../utils/date.js';

const STORAGE_KEYS = {
  CONFIG: 'nusapos_api_config_v1',
  PRODUCTS: 'nusapos_products_v1',
  MEMBERS: 'nusapos_members_v1',
  TRANSACTIONS: 'nusapos_transactions_v1',
  TX_ITEMS: 'nusapos_tx_items_v1',
  SETTINGS: 'nusapos_settings_v1',
  USERS: 'nusapos_users_v1',
  SESSION: 'nusapos_session_v1'
};

const SEED_PRODUCTS = [
  {
    product_id: 'PRD-1001',
    name: 'Kopi Susu Gula Aren 250ml',
    sku: 'BVG-001',
    barcode: '8991001000011',
    category: 'Beverages',
    price: 18000,
    cost_price: 9500,
    stock: 34,
    unit: 'bottle',
    image_url: '',
    status: 'active',
    updated_at: new Date().toISOString()
  },
  {
    product_id: 'PRD-1002',
    name: 'Matcha Oat Latte 250ml',
    sku: 'BVG-002',
    barcode: '8991001000028',
    category: 'Beverages',
    price: 22000,
    cost_price: 12000,
    stock: 19,
    unit: 'bottle',
    image_url: '',
    status: 'active',
    updated_at: new Date().toISOString()
  },
  {
    product_id: 'PRD-1003',
    name: 'Air Mineral Pegunungan 600ml',
    sku: 'BVG-003',
    barcode: '8991001000035',
    category: 'Beverages',
    price: 5000,
    cost_price: 2800,
    stock: 72,
    unit: 'bottle',
    image_url: '',
    status: 'active',
    updated_at: new Date().toISOString()
  },
  {
    product_id: 'PRD-1004',
    name: 'Butter Croissant Classic',
    sku: 'BKR-001',
    barcode: '8991001000042',
    category: 'Bakery',
    price: 20000,
    cost_price: 10500,
    stock: 8,
    unit: 'pcs',
    image_url: '',
    status: 'active',
    updated_at: new Date().toISOString()
  },
  {
    product_id: 'PRD-1005',
    name: 'Pain au Chocolat',
    sku: 'BKR-002',
    barcode: '8991001000059',
    category: 'Bakery',
    price: 23000,
    cost_price: 12000,
    stock: 6,
    unit: 'pcs',
    image_url: '',
    status: 'active',
    updated_at: new Date().toISOString()
  },
  {
    product_id: 'PRD-1006',
    name: 'Sourdough Loaf Country',
    sku: 'BKR-003',
    barcode: '8991001000066',
    category: 'Bakery',
    price: 42000,
    cost_price: 22000,
    stock: 5,
    unit: 'loaf',
    image_url: '',
    status: 'active',
    updated_at: new Date().toISOString()
  },
  {
    product_id: 'PRD-1007',
    name: 'Keripik Singkong Balado 150g',
    sku: 'SNK-001',
    barcode: '8991001000073',
    category: 'Snacks',
    price: 14500,
    cost_price: 8500,
    stock: 28,
    unit: 'pack',
    image_url: '',
    status: 'active',
    updated_at: new Date().toISOString()
  },
  {
    product_id: 'PRD-1008',
    name: 'Almond Roasted Sea Salt 100g',
    sku: 'SNK-002',
    barcode: '8991001000080',
    category: 'Snacks',
    price: 32000,
    cost_price: 21000,
    stock: 15,
    unit: 'pack',
    image_url: '',
    status: 'active',
    updated_at: new Date().toISOString()
  },
  {
    product_id: 'PRD-1009',
    name: 'Beras Pandan Wangi Premium 5kg',
    sku: 'GRC-001',
    barcode: '8991001000097',
    category: 'Groceries',
    price: 78500,
    cost_price: 66000,
    stock: 14,
    unit: 'bag',
    image_url: '',
    status: 'active',
    updated_at: new Date().toISOString()
  },
  {
    product_id: 'PRD-1010',
    name: 'Minyak Goreng Kelapa 1L',
    sku: 'GRC-002',
    barcode: '8991001000103',
    category: 'Groceries',
    price: 26500,
    cost_price: 21000,
    stock: 22,
    unit: 'pouch',
    image_url: '',
    status: 'active',
    updated_at: new Date().toISOString()
  },
  {
    product_id: 'PRD-1011',
    name: 'Sabun Cair Organic Chamomile 400ml',
    sku: 'HOM-001',
    barcode: '8991001000110',
    category: 'Personal Care',
    price: 38000,
    cost_price: 24000,
    stock: 11,
    unit: 'bottle',
    image_url: '',
    status: 'active',
    updated_at: new Date().toISOString()
  },
  {
    product_id: 'PRD-1012',
    name: 'Tote Bag Kanvas Reusable',
    sku: 'ACC-001',
    barcode: '8991001000127',
    category: 'Accessories',
    price: 25000,
    cost_price: 13000,
    stock: 0,
    unit: 'pcs',
    image_url: '',
    status: 'active',
    updated_at: new Date().toISOString()
  }
];

const SEED_MEMBERS = [
  {
    member_id: 'MBR-1001',
    name: 'Rina Wijaya',
    phone: '081234567890',
    email: 'rina.wijaya@example.com',
    registered_at: '2026-01-15T09:30:00.000Z',
    points: 145,
    status: 'active'
  },
  {
    member_id: 'MBR-1002',
    name: 'Budi Santoso',
    phone: '081398765432',
    email: 'budi.santoso@example.com',
    registered_at: '2026-02-20T14:15:00.000Z',
    points: 82,
    status: 'active'
  },
  {
    member_id: 'MBR-1003',
    name: 'Sari Kusuma',
    phone: '085711223344',
    email: '',
    registered_at: '2026-03-10T11:00:00.000Z',
    points: 210,
    status: 'active'
  }
];

const DEFAULT_SETTINGS = {
  store_name: 'NusaMart & Roastery',
  store_address: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta',
  store_phone: '021-5550188',
  store_logo: '',
  receipt_footer: 'Terima kasih telah berbelanja! Barang yang sudah dibeli tidak dapat ditukar.',
  default_receipt_width: '80mm',
  default_payment_method: 'Cash',
  currency: 'IDR',
  low_stock_threshold: 10,
  enable_member_points: true,
  points_earn_rate: 10000,
  enable_discounts: true,
  member_discount_percent: 0
};

const SEED_USERS = [
  {
    user_id: 'USR-001',
    name: 'Alya Pratama',
    username: 'admin',
    password_plain_dev: 'admin123',
    role: 'admin',
    status: 'active'
  },
  {
    user_id: 'USR-002',
    name: 'Dimas Saputra',
    username: 'kasir1',
    password_plain_dev: 'kasir123',
    role: 'cashier',
    status: 'active'
  }
];

function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureMockSeeded() {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    writeStore(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    writeStore(STORAGE_KEYS.MEMBERS, SEED_MEMBERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    writeStore(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    writeStore(STORAGE_KEYS.USERS, SEED_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    const todayIso = new Date().toISOString();
    const sampleTx = [
      {
        transaction_id: 'TRX-20261124-0001',
        date: todayIso,
        cashier: 'Alya Pratama',
        member_id: 'MBR-1001',
        member_name: 'Rina Wijaya',
        subtotal: 58000,
        discount: 0,
        total: 58000,
        payment_method: 'QRIS',
        amount_paid: 58000,
        change_amount: 0
      },
      {
        transaction_id: 'TRX-20261124-0002',
        date: todayIso,
        cashier: 'Dimas Saputra',
        member_id: '',
        member_name: '',
        subtotal: 45000,
        discount: 5000,
        total: 40000,
        payment_method: 'Cash',
        amount_paid: 50000,
        change_amount: 10000
      }
    ];
    const sampleItems = [
      {
        item_id: 'ITEM-001',
        transaction_id: 'TRX-20261124-0001',
        product_id: 'PRD-1001',
        product_name: 'Kopi Susu Gula Aren 250ml',
        sku: 'BVG-001',
        quantity: 2,
        price: 18000,
        discount: 0,
        line_total: 36000
      },
      {
        item_id: 'ITEM-002',
        transaction_id: 'TRX-20261124-0001',
        product_id: 'PRD-1002',
        product_name: 'Matcha Oat Latte 250ml',
        sku: 'BVG-002',
        quantity: 1,
        price: 22000,
        discount: 0,
        line_total: 22000
      },
      {
        item_id: 'ITEM-003',
        transaction_id: 'TRX-20261124-0002',
        product_id: 'PRD-1004',
        product_name: 'Butter Croissant Classic',
        sku: 'BKR-001',
        quantity: 1,
        price: 20000,
        discount: 0,
        line_total: 20000
      },
      {
        item_id: 'ITEM-004',
        transaction_id: 'TRX-20261124-0002',
        product_id: 'PRD-1012',
        product_name: 'Tote Bag Kanvas Reusable',
        sku: 'ACC-001',
        quantity: 1,
        price: 25000,
        discount: 0,
        line_total: 25000
      }
    ];
    writeStore(STORAGE_KEYS.TRANSACTIONS, sampleTx);
    writeStore(STORAGE_KEYS.TX_ITEMS, sampleItems);
  }
}

export function getApiConfig() {
  const saved = readStore(STORAGE_KEYS.CONFIG, null);
  const envUrl = import.meta.env.VITE_GAS_WEB_APP_URL || '';
  const envMode = import.meta.env.VITE_API_MODE || (envUrl ? 'production' : 'mock');
  return {
    mode: saved?.mode || envMode,
    webAppUrl: saved?.webAppUrl !== undefined ? saved.webAppUrl : envUrl
  };
}

export function saveApiConfig(config) {
  writeStore(STORAGE_KEYS.CONFIG, config);
}

export function resetMockDatabase() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    if (key !== STORAGE_KEYS.CONFIG) {
      localStorage.removeItem(key);
    }
  });
  ensureMockSeeded();
}

function getSessionToken() {
  const session = readStore(STORAGE_KEYS.SESSION, null);
  return session?.token || '';
}

async function dispatch(action, payload = {}, mockHandler) {
  const config = getApiConfig();
  if (config.mode === 'production' && config.webAppUrl) {
    return callAppsScript({
      webAppUrl: config.webAppUrl,
      action,
      payload,
      token: getSessionToken()
    });
  }

  ensureMockSeeded();
  await new Promise((r) => setTimeout(r, 90));
  return mockHandler(payload);
}

export const api = {
  // AUTH
  async authenticateUser({ username, password }) {
    return dispatch('authenticateUser', { username, password }, ({ username: u, password: p }) => {
      const users = readStore(STORAGE_KEYS.USERS, SEED_USERS);
      const found = users.find(
        (usr) =>
          usr.username.toLowerCase() === String(u || '').trim().toLowerCase() &&
          usr.password_plain_dev === p &&
          usr.status === 'active'
      );
      if (!found) {
        return { success: false, message: 'Invalid username or password.', data: null };
      }
      const session = {
        token: `mock-token-${found.user_id}-${Date.now()}`,
        user: {
          user_id: found.user_id,
          name: found.name,
          username: found.username,
          role: found.role
        }
      };
      writeStore(STORAGE_KEYS.SESSION, session);
      return { success: true, message: 'Authenticated', data: session };
    });
  },

  // PRODUCTS
  async getProducts() {
    return dispatch('getProducts', {}, () => {
      const products = readStore(STORAGE_KEYS.PRODUCTS, []);
      return { success: true, message: 'Products loaded', data: products };
    });
  },

  async searchProducts(query) {
    return dispatch('searchProducts', { query }, ({ query: q }) => {
      const term = String(q || '').toLowerCase().trim();
      const products = readStore(STORAGE_KEYS.PRODUCTS, []);
      const filtered = term
        ? products.filter(
            (p) =>
              p.name.toLowerCase().includes(term) ||
              p.sku.toLowerCase().includes(term) ||
              p.barcode.toLowerCase().includes(term)
          )
        : products;
      return { success: true, message: 'Search complete', data: filtered };
    });
  },

  async createProduct(productData) {
    return dispatch('createProduct', productData, (data) => {
      const products = readStore(STORAGE_KEYS.PRODUCTS, []);
      const sku = String(data.sku || '').trim();
      const barcode = String(data.barcode || '').trim();

      if (!data.name || !sku || Number(data.price) < 0) {
        return { success: false, message: 'Name, SKU, and valid price are required.', data: null };
      }
      if (products.some((p) => p.sku.toLowerCase() === sku.toLowerCase())) {
        return { success: false, message: `SKU "${sku}" already exists.`, data: null };
      }
      if (barcode && products.some((p) => p.barcode === barcode)) {
        return { success: false, message: `Barcode "${barcode}" already exists.`, data: null };
      }

      const newProduct = {
        product_id: `PRD-${Date.now().toString().slice(-6)}`,
        name: String(data.name).trim(),
        sku,
        barcode,
        category: String(data.category || 'General').trim(),
        price: Math.max(0, Math.round(Number(data.price) || 0)),
        cost_price: Math.max(0, Math.round(Number(data.cost_price) || 0)),
        stock: Math.max(0, Math.round(Number(data.stock) || 0)),
        unit: String(data.unit || 'pcs').trim(),
        image_url: String(data.image_url || '').trim(),
        status: data.status === 'inactive' ? 'inactive' : 'active',
        updated_at: new Date().toISOString()
      };

      const updated = [newProduct, ...products];
      writeStore(STORAGE_KEYS.PRODUCTS, updated);
      return { success: true, message: 'Product created', data: newProduct };
    });
  },

  async updateProduct(productData) {
    return dispatch('updateProduct', productData, (data) => {
      const products = readStore(STORAGE_KEYS.PRODUCTS, []);
      const idx = products.findIndex((p) => p.product_id === data.product_id);
      if (idx === -1) {
        return { success: false, message: 'Product not found.', data: null };
      }

      const sku = String(data.sku ?? products[idx].sku).trim();
      const barcode = String(data.barcode ?? products[idx].barcode).trim();

      if (
        products.some(
          (p) => p.product_id !== data.product_id && p.sku.toLowerCase() === sku.toLowerCase()
        )
      ) {
        return { success: false, message: `Duplicate SKU "${sku}".`, data: null };
      }
      if (
        barcode &&
        products.some((p) => p.product_id !== data.product_id && p.barcode === barcode)
      ) {
        return { success: false, message: `Duplicate barcode "${barcode}".`, data: null };
      }

      const updatedProduct = {
        ...products[idx],
        ...data,
        sku,
        barcode,
        price: Math.max(0, Math.round(Number(data.price ?? products[idx].price))),
        cost_price: Math.max(0, Math.round(Number(data.cost_price ?? products[idx].cost_price))),
        stock: Math.max(0, Math.round(Number(data.stock ?? products[idx].stock))),
        updated_at: new Date().toISOString()
      };

      products[idx] = updatedProduct;
      writeStore(STORAGE_KEYS.PRODUCTS, products);
      return { success: true, message: 'Product updated', data: updatedProduct };
    });
  },

  async updateStock({ product_id, stock }) {
    return dispatch('updateStock', { product_id, stock }, ({ product_id: id, stock: s }) => {
      const products = readStore(STORAGE_KEYS.PRODUCTS, []);
      const idx = products.findIndex((p) => p.product_id === id);
      if (idx === -1) return { success: false, message: 'Product not found.', data: null };
      const parsedStock = Math.round(Number(s));
      if (parsedStock < 0) {
        return { success: false, message: 'Stock cannot be negative.', data: null };
      }
      products[idx] = {
        ...products[idx],
        stock: parsedStock,
        updated_at: new Date().toISOString()
      };
      writeStore(STORAGE_KEYS.PRODUCTS, products);
      return { success: true, message: 'Stock updated', data: products[idx] };
    });
  },

  async deleteProduct(product_id) {
    return dispatch('deleteProduct', { product_id }, ({ product_id: id }) => {
      const products = readStore(STORAGE_KEYS.PRODUCTS, []);
      const filtered = products.filter((p) => p.product_id !== id);
      if (filtered.length === products.length) {
        return { success: false, message: 'Product not found.', data: null };
      }
      writeStore(STORAGE_KEYS.PRODUCTS, filtered);
      return { success: true, message: 'Product deleted', data: { product_id: id } };
    });
  },

  // MEMBERS
  async getMembers() {
    return dispatch('getMembers', {}, () => {
      return { success: true, message: 'Members loaded', data: readStore(STORAGE_KEYS.MEMBERS, []) };
    });
  },

  async searchMembers(query) {
    return dispatch('searchMembers', { query }, ({ query: q }) => {
      const term = String(q || '').toLowerCase().trim();
      const members = readStore(STORAGE_KEYS.MEMBERS, []);
      const filtered = term
        ? members.filter(
            (m) => m.name.toLowerCase().includes(term) || m.phone.toLowerCase().includes(term)
          )
        : members;
      return { success: true, message: 'Members searched', data: filtered };
    });
  },

  async createMember(memberData) {
    return dispatch('createMember', memberData, (data) => {
      const members = readStore(STORAGE_KEYS.MEMBERS, []);
      const name = String(data.name || '').trim();
      const phone = String(data.phone || '').trim();
      if (!name || !phone) {
        return { success: false, message: 'Member name and phone are required.', data: null };
      }
      if (members.some((m) => m.phone === phone)) {
        return { success: false, message: 'Phone number already registered.', data: null };
      }
      const newMember = {
        member_id: `MBR-${Date.now().toString().slice(-6)}`,
        name,
        phone,
        email: String(data.email || '').trim(),
        registered_at: new Date().toISOString(),
        points: Math.max(0, Math.round(Number(data.points) || 0)),
        status: data.status === 'inactive' ? 'inactive' : 'active'
      };
      writeStore(STORAGE_KEYS.MEMBERS, [newMember, ...members]);
      return { success: true, message: 'Member registered', data: newMember };
    });
  },

  async updateMember(memberData) {
    return dispatch('updateMember', memberData, (data) => {
      const members = readStore(STORAGE_KEYS.MEMBERS, []);
      const idx = members.findIndex((m) => m.member_id === data.member_id);
      if (idx === -1) return { success: false, message: 'Member not found.', data: null };
      members[idx] = {
        ...members[idx],
        ...data,
        points: Math.max(0, Math.round(Number(data.points ?? members[idx].points)))
      };
      writeStore(STORAGE_KEYS.MEMBERS, members);
      return { success: true, message: 'Member updated', data: members[idx] };
    });
  },

  // TRANSACTIONS
  async createTransaction(txPayload) {
    return dispatch('createTransaction', txPayload, (payload) => {
      const products = readStore(STORAGE_KEYS.PRODUCTS, []);
      const members = readStore(STORAGE_KEYS.MEMBERS, []);
      const settings = readStore(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      const transactions = readStore(STORAGE_KEYS.TRANSACTIONS, []);
      const allTxItems = readStore(STORAGE_KEYS.TX_ITEMS, []);

      if (!Array.isArray(payload.items) || payload.items.length === 0) {
        return { success: false, message: 'Cart cannot be empty.', data: null };
      }

      // Server-authoritative validation & recalculation
      const verifiedItems = [];
      for (const reqItem of payload.items) {
        const dbProduct = products.find((p) => p.product_id === reqItem.product_id);
        if (!dbProduct || dbProduct.status !== 'active') {
          return {
            success: false,
            message: `Product "${reqItem.name || reqItem.product_id}" is unavailable.`,
            data: null
          };
        }
        const qty = Math.max(1, Math.round(Number(reqItem.quantity) || 0));
        if (dbProduct.stock < qty) {
          return {
            success: false,
            message: `Insufficient stock for ${dbProduct.name} (available: ${dbProduct.stock}).`,
            data: null
          };
        }
        verifiedItems.push({
          product_id: dbProduct.product_id,
          name: dbProduct.name,
          sku: dbProduct.sku,
          price: dbProduct.price,
          quantity: qty,
          discountType: reqItem.discountType || 'none',
          discountValue: Number(reqItem.discountValue) || 0,
          discountReason: reqItem.discountReason || ''
        });
      }

      const member = payload.member_id
        ? members.find((m) => m.member_id === payload.member_id && m.status === 'active') || null
        : null;

      const summary = calculateCartSummary({
        items: verifiedItems,
        transactionDiscountType: payload.transactionDiscountType || 'none',
        transactionDiscountValue: Number(payload.transactionDiscountValue) || 0,
        member,
        settings
      });

      const amountPaid = Math.round(Number(payload.amount_paid) || 0);
      if (payload.payment_method === 'Cash' && amountPaid < summary.grandTotal) {
        return { success: false, message: 'Cash paid is less than grand total.', data: null };
      }

      const changeAmount =
        payload.payment_method === 'Cash' ? Math.max(0, amountPaid - summary.grandTotal) : 0;

      const datePart = getTodayISODate().replace(/-/g, '');
      const seq = String(transactions.length + 1).padStart(4, '0');
      const transactionId = `TRX-${datePart}-${seq}`;
      const nowIso = new Date().toISOString();

      // Deduct stock atomically
      const updatedProducts = products.map((prod) => {
        const bought = summary.items.find((i) => i.product_id === prod.product_id);
        if (!bought) return prod;
        return {
          ...prod,
          stock: Math.max(0, prod.stock - bought.quantity),
          updated_at: nowIso
        };
      });
      writeStore(STORAGE_KEYS.PRODUCTS, updatedProducts);

      // Update member points
      let updatedMember = member;
      if (member && summary.estimatedPoints > 0) {
        const updatedMembers = members.map((m) => {
          if (m.member_id !== member.member_id) return m;
          updatedMember = { ...m, points: (m.points || 0) + summary.estimatedPoints };
          return updatedMember;
        });
        writeStore(STORAGE_KEYS.MEMBERS, updatedMembers);
      }

      const txRecord = {
        transaction_id: transactionId,
        date: nowIso,
        cashier: payload.cashier || 'Cashier',
        member_id: member ? member.member_id : '',
        member_name: member ? member.name : '',
        subtotal: summary.rawSubtotal,
        discount: summary.totalDiscount,
        transaction_discount: summary.transactionDiscountAmount,
        discount_reason: payload.transactionDiscountReason || '',
        total: summary.grandTotal,
        payment_method: payload.payment_method || 'Cash',
        amount_paid: payload.payment_method === 'Cash' ? amountPaid : summary.grandTotal,
        change_amount: changeAmount,
        points_earned: summary.estimatedPoints
      };

      const txItemRecords = summary.items.map((item, idx) => ({
        item_id: `${transactionId}-${idx + 1}`,
        transaction_id: transactionId,
        product_id: item.product_id,
        product_name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        discount: item.discountAmount,
        line_total: item.lineTotal
      }));

      writeStore(STORAGE_KEYS.TRANSACTIONS, [txRecord, ...transactions]);
      writeStore(STORAGE_KEYS.TX_ITEMS, [...txItemRecords, ...allTxItems]);

      return {
        success: true,
        message: 'Transaction completed',
        data: {
          transaction: txRecord,
          items: txItemRecords,
          member: updatedMember
        }
      };
    });
  },

  async getTransactions() {
    return dispatch('getTransactions', {}, () => {
      const transactions = readStore(STORAGE_KEYS.TRANSACTIONS, []);
      return { success: true, message: 'Transactions loaded', data: transactions };
    });
  },

  async getTransactionDetails(transaction_id) {
    return dispatch('getTransactionDetails', { transaction_id }, ({ transaction_id: id }) => {
      const transactions = readStore(STORAGE_KEYS.TRANSACTIONS, []);
      const allItems = readStore(STORAGE_KEYS.TX_ITEMS, []);
      const transaction = transactions.find((t) => t.transaction_id === id);
      if (!transaction) {
        return { success: false, message: 'Transaction not found.', data: null };
      }
      const items = allItems.filter((i) => i.transaction_id === id);
      return {
        success: true,
        message: 'Details loaded',
        data: { transaction, items }
      };
    });
  },

  // REPORTS
  async getReports() {
    return dispatch('getReports', {}, () => {
      const transactions = readStore(STORAGE_KEYS.TRANSACTIONS, []);
      const allItems = readStore(STORAGE_KEYS.TX_ITEMS, []);
      const today = getTodayISODate();

      const todayTx = transactions.filter((t) => String(t.date || '').startsWith(today));
      const todaySales = todayTx.reduce((s, t) => s + Number(t.total || 0), 0);
      const totalTransactions = todayTx.length;
      const todayTxIds = new Set(todayTx.map((t) => t.transaction_id));
      const totalItemsSold = allItems
        .filter((i) => todayTxIds.has(i.transaction_id))
        .reduce((s, i) => s + Number(i.quantity || 0), 0);
      const averageTransaction =
        totalTransactions > 0 ? Math.round(todaySales / totalTransactions) : 0;

      const paymentMap = {};
      transactions.forEach((t) => {
        const pm = t.payment_method || 'Other';
        if (!paymentMap[pm]) paymentMap[pm] = { method: pm, count: 0, total: 0 };
        paymentMap[pm].count += 1;
        paymentMap[pm].total += Number(t.total || 0);
      });

      const productMap = {};
      allItems.forEach((item) => {
        if (!productMap[item.product_id]) {
          productMap[item.product_id] = {
            product_id: item.product_id,
            product_name: item.product_name,
            sku: item.sku,
            quantity: 0,
            revenue: 0
          };
        }
        productMap[item.product_id].quantity += Number(item.quantity || 0);
        productMap[item.product_id].revenue += Number(item.line_total || 0);
      });

      const dailyMap = {};
      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dailyMap[key] = { date: key, total: 0, count: 0 };
      }
      transactions.forEach((t) => {
        const key = String(t.date || '').slice(0, 10);
        if (dailyMap[key]) {
          dailyMap[key].total += Number(t.total || 0);
          dailyMap[key].count += 1;
        }
      });

      return {
        success: true,
        message: 'Reports generated',
        data: {
          todaySales,
          totalTransactions,
          totalItemsSold,
          averageTransaction,
          paymentBreakdown: Object.values(paymentMap).sort((a, b) => b.total - a.total),
          bestSellingProducts: Object.values(productMap)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 6),
          dailySales: Object.values(dailyMap)
        }
      };
    });
  },

  // SETTINGS
  async getSettings() {
    return dispatch('getSettings', {}, () => {
      return {
        success: true,
        message: 'Settings loaded',
        data: readStore(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
      };
    });
  },

  async updateSettings(newSettings) {
    return dispatch('updateSettings', newSettings, (data) => {
      const current = readStore(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      const merged = { ...current, ...data };
      writeStore(STORAGE_KEYS.SETTINGS, merged);
      return { success: true, message: 'Settings saved', data: merged };
    });
  }
};
