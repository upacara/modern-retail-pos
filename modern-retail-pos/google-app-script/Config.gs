var DB_SCHEMA = {
  Products: [
    'product_id',
    'name',
    'sku',
    'barcode',
    'category',
    'price',
    'cost_price',
    'stock',
    'unit',
    'image_url',
    'status',
    'updated_at'
  ],
  Members: [
    'member_id',
    'name',
    'phone',
    'email',
    'registered_at',
    'points',
    'status'
  ],
  Transactions: [
    'transaction_id',
    'date',
    'cashier',
    'member_id',
    'subtotal',
    'discount',
    'total',
    'payment_method',
    'amount_paid',
    'change_amount'
  ],
  TransactionItems: [
    'item_id',
    'transaction_id',
    'product_id',
    'product_name',
    'sku',
    'quantity',
    'price',
    'discount',
    'line_total'
  ],
  Settings: ['key', 'value'],
  Users: ['user_id', 'name', 'username', 'password_hash', 'role', 'status']
};

function getSpreadsheet() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('SPREADSHEET_ID');
  if (sheetId) {
    return SpreadsheetApp.openById(sheetId);
  }
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    props.setProperty('SPREADSHEET_ID', active.getId());
    return active;
  }
  var created = SpreadsheetApp.create('Kassa_POS_Database');
  props.setProperty('SPREADSHEET_ID', created.getId());
  return created;
}

/**
 * Inisialisasi otomatis seluruh sheet database, header kolom,
 * pengaturan default, akun pengguna awal (password ter-hash), dan data uji.
 */
function initializeDatabase() {
  var ss = getSpreadsheet();
  var sheetNames = Object.keys(DB_SCHEMA);

  sheetNames.forEach(function (name) {
    var sheet = ss.getSheetByName(name);
    var headers = DB_SCHEMA[name];
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });

  // Hapus Sheet1 bawaan kosong jika semua sheet skema sudah dibuat
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > sheetNames.length && defaultSheet.getLastRow() === 0) {
    ss.deleteSheet(defaultSheet);
  }

  // Seed Settings awal
  var settingsSheet = ss.getSheetByName('Settings');
  if (settingsSheet.getLastRow() <= 1) {
    var defaultSettings = [
      ['store_name', 'Kassa Market & Roastery'],
      ['store_address', 'Jl. Senopati No. 48, Kebayoran Baru, Jakarta Selatan'],
      ['store_phone', '+62 21 5550 1928'],
      ['store_logo', ''],
      ['receipt_footer', 'Terima kasih telah berbelanja! Barang yang sudah dibeli tidak dapat ditukar.'],
      ['default_receipt_width', '80'],
      ['default_payment_method', 'Cash'],
      ['currency', 'IDR'],
      ['low_stock_threshold', '10'],
      ['enable_member_points', 'true'],
      ['enable_discounts', 'true']
    ];
    settingsSheet.getRange(2, 1, defaultSettings.length, 2).setValues(defaultSettings);
  }

  // Seed Users awal (tanpa plaintext password)
  var usersSheet = ss.getSheetByName('Users');
  if (usersSheet.getLastRow() <= 1) {
    var defaultUsers = [
      ['USR-01', 'Dina Sari', 'admin', hashPassword('admin123'), 'admin', 'active'],
      ['USR-02', 'Bima Putra', 'kasir', hashPassword('kasir123'), 'cashier', 'active']
    ];
    usersSheet.getRange(2, 1, defaultUsers.length, 6).setValues(defaultUsers);
  }

  // Seed Products uji awal
  var productsSheet = ss.getSheetByName('Products');
  if (productsSheet.getLastRow() <= 1) {
    var now = new Date().toISOString();
    var sampleProducts = [
      ['PRD-1001', 'Kopi Susu Gula Aren 250ml', 'BEV-001', '8991001000011', 'Beverages', 18000, 9500, 42, 'bottle', '', 'active', now],
      ['PRD-1002', 'Matcha Oat Latte 250ml', 'BEV-002', '8991001000028', 'Beverages', 24000, 13000, 19, 'bottle', '', 'active', now],
      ['PRD-1003', 'Artisan Butter Croissant', 'BAK-001', '8991001000035', 'Bakery', 22000, 11000, 6, 'pcs', '', 'active', now],
      ['PRD-1004', 'Sourdough Country Loaf', 'BAK-002', '8991001000042', 'Bakery', 45000, 24000, 8, 'loaf', '', 'active', now],
      ['PRD-1005', 'Organic Honey Granola 300g', 'PAN-001', '8991001000059', 'Pantry', 58000, 36000, 15, 'pack', '', 'active', now],
      ['PRD-1006', 'Sea Salt Dark Chocolate 85g', 'SNK-001', '8991001000066', 'Snacks', 34000, 20000, 27, 'bar', '', 'active', now],
      ['PRD-1007', 'Roasted Almond Trail Mix 150g', 'SNK-002', '8991001000073', 'Snacks', 32500, 19500, 4, 'pouch', '', 'active', now],
      ['PRD-1008', 'Mineral Water Sparkling 330ml', 'BEV-003', '8991001000080', 'Beverages', 10000, 5500, 60, 'bottle', '', 'active', now],
      ['PRD-1009', 'Cold Pressed Orange Juice', 'BEV-004', '8991001000097', 'Beverages', 25500, 14000, 12, 'bottle', '', 'active', now],
      ['PRD-1010', 'Reusable Canvas Tote Bag', 'MER-001', '8991001000103', 'Merchandise', 65000, 32000, 0, 'pcs', '', 'active', now]
    ];
    productsSheet.getRange(2, 1, sampleProducts.length, 12).setValues(sampleProducts);
  }

  // Seed Members uji awal
  var membersSheet = ss.getSheetByName('Members');
  if (membersSheet.getLastRow() <= 1) {
    var sampleMembers = [
      ['MBR-101', 'Nadia Kusuma', '081234567890', 'nadia.kusuma@example.com', '2026-06-14T10:20:00.000Z', 145, 'active'],
      ['MBR-102', 'Raka Pratama', '081298765432', 'raka.p@example.com', '2026-08-03T14:15:00.000Z', 62, 'active'],
      ['MBR-103', 'Sinta Maharani', '085711223344', '', '2026-10-19T09:40:00.000Z', 28, 'active']
    ];
    membersSheet.getRange(2, 1, sampleMembers.length, 7).setValues(sampleMembers);
  }

  CacheService.getScriptCache().put('DB_INITIALIZED', '1', 21600);
  return { initialized: true, spreadsheetId: ss.getId() };
}

function ensureDatabaseReady() {
  var cache = CacheService.getScriptCache();
  if (cache.get('DB_INITIALIZED') === '1') {
    return;
  }
  initializeDatabase();
}
