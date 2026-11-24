function getProducts() {
  var rows = sheetToObjects('Products');
  return rows.map(function (r) {
    delete r._rowIndex;
    r.price = Number(r.price || 0);
    r.cost_price = Number(r.cost_price || 0);
    r.stock = Number(r.stock || 0);
    r.barcode = String(r.barcode || '');
    return r;
  });
}

function searchProducts(payload) {
  var q = String((payload && payload.query) || '')
    .trim()
    .toLowerCase();
  var all = getProducts();
  if (!q) return all;

  return all.filter(function (p) {
    return (
      String(p.name).toLowerCase().indexOf(q) !== -1 ||
      String(p.sku).toLowerCase().indexOf(q) !== -1 ||
      String(p.barcode).toLowerCase().indexOf(q) !== -1
    );
  });
}

function createProduct(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var name = String(payload.name || '').trim();
    var sku = String(payload.sku || '')
      .trim()
      .toUpperCase();
    var barcode = String(payload.barcode || '').trim();
    var price = Number(payload.price);
    var costPrice = Number(payload.cost_price || 0);
    var stock = Number(payload.stock);

    if (!name || !sku) throw new Error('Product name and SKU are required.');
    if (isNaN(price) || price < 0) throw new Error('Selling price must be >= 0.');
    if (isNaN(stock) || stock < 0) throw new Error('Stock quantity cannot be negative.');

    var existing = getProducts();
    for (var i = 0; i < existing.length; i++) {
      if (String(existing[i].sku).toUpperCase() === sku) {
        throw new Error('Duplicate SKU: ' + sku);
      }
      if (barcode && String(existing[i].barcode) === barcode) {
        throw new Error('Duplicate barcode: ' + barcode);
      }
    }

    var id = generateId('PRD');
    var now = new Date().toISOString();
    var record = {
      product_id: id,
      name: name,
      sku: sku,
      barcode: barcode,
      category: String(payload.category || 'General').trim(),
      price: Math.round(price),
      cost_price: Math.round(Math.max(0, costPrice)),
      stock: Math.round(stock),
      unit: String(payload.unit || 'pcs').trim(),
      image_url: String(payload.image_url || '').trim(),
      status: payload.status === 'inactive' ? 'inactive' : 'active',
      updated_at: now
    };

    var sheet = getSpreadsheet().getSheetByName('Products');
    sheet.appendRow([
      record.product_id,
      record.name,
      record.sku,
      record.barcode,
      record.category,
      record.price,
      record.cost_price,
      record.stock,
      record.unit,
      record.image_url,
      record.status,
      record.updated_at
    ]);

    return record;
  } finally {
    lock.releaseLock();
  }
}

function updateProduct(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var productId = String(payload.product_id || '').trim();
    if (!productId) throw new Error('product_id is required.');

    var rows = sheetToObjects('Products');
    var target = null;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].product_id === productId) {
        target = rows[i];
        break;
      }
    }
    if (!target) throw new Error('Product not found.');

    var nextSku =
      payload.sku !== undefined
        ? String(payload.sku)
            .trim()
            .toUpperCase()
        : String(target.sku).toUpperCase();
    var nextBarcode =
      payload.barcode !== undefined ? String(payload.barcode).trim() : String(target.barcode || '');
    var nextPrice = payload.price !== undefined ? Number(payload.price) : Number(target.price);
    var nextStock = payload.stock !== undefined ? Number(payload.stock) : Number(target.stock);

    if (isNaN(nextPrice) || nextPrice < 0 || isNaN(nextStock) || nextStock < 0) {
      throw new Error('Price and stock cannot be negative.');
    }

    for (var j = 0; j < rows.length; j++) {
      if (rows[j].product_id === productId) continue;
      if (String(rows[j].sku).toUpperCase() === nextSku) {
        throw new Error('SKU already exists on another product.');
      }
      if (nextBarcode && String(rows[j].barcode) === nextBarcode) {
        throw new Error('Barcode already exists on another product.');
      }
    }

    var updated = {
      product_id: productId,
      name: payload.name !== undefined ? String(payload.name).trim() : target.name,
      sku: nextSku,
      barcode: nextBarcode,
      category: payload.category !== undefined ? String(payload.category).trim() : target.category,
      price: Math.round(nextPrice),
      cost_price:
        payload.cost_price !== undefined
          ? Math.round(Math.max(0, Number(payload.cost_price)))
          : Number(target.cost_price || 0),
      stock: Math.round(nextStock),
      unit: payload.unit !== undefined ? String(payload.unit).trim() : target.unit,
      image_url: payload.image_url !== undefined ? String(payload.image_url).trim() : target.image_url,
      status: payload.status !== undefined ? payload.status : target.status,
      updated_at: new Date().toISOString()
    };

    var sheet = getSpreadsheet().getSheetByName('Products');
    sheet
      .getRange(target._rowIndex, 1, 1, 12)
      .setValues([
        [
          updated.product_id,
          updated.name,
          updated.sku,
          updated.barcode,
          updated.category,
          updated.price,
          updated.cost_price,
          updated.stock,
          updated.unit,
          updated.image_url,
          updated.status,
          updated.updated_at
        ]
      ]);

    return updated;
  } finally {
    lock.releaseLock();
  }
}

function updateStock(payload) {
  return updateProduct({
    product_id: payload.product_id,
    stock: payload.stock
  });
}

function deleteProduct(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var productId = String(payload.product_id || '').trim();
    var rows = sheetToObjects('Products');
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].product_id === productId) {
        getSpreadsheet().getSheetByName('Products').deleteRow(rows[i]._rowIndex);
        return { deleted: true, product_id: productId };
      }
    }
    throw new Error('Product not found.');
  } finally {
    lock.releaseLock();
  }
}
