function computeServerDiscount(base, disc) {
  if (!disc || !disc.value || Number(disc.value) <= 0 || base <= 0) return 0;
  var val = Number(disc.value);
  var computed =
    disc.type === 'percentage'
      ? Math.round((base * Math.min(Math.max(val, 0), 100)) / 100)
      : Math.round(Math.max(val, 0));
  return Math.min(computed, base);
}

/**
 * Pemrosesan checkout atomik dengan LockService.
 * Harga satuan, stok, diskon, grand total, dan poin dihitung ulang
 * sepenuhnya di server berdasarkan data sheet Products.
 */
function createTransaction(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    if (!payload || !payload.items || !payload.items.length) {
      throw new Error('Cart cannot be empty.');
    }

    var ss = getSpreadsheet();
    var settings = getSettings();
    var productRows = sheetToObjects('Products');
    var productMap = {};
    for (var i = 0; i < productRows.length; i++) {
      productMap[productRows[i].product_id] = productRows[i];
    }

    var rawSubtotal = 0;
    var totalItemDiscounts = 0;
    var verifiedItems = [];

    // 1. Validasi stok & hitung ulang harga item langsung dari database
    for (var j = 0; j < payload.items.length; j++) {
      var reqItem = payload.items[j];
      var qty = Math.floor(Number(reqItem.quantity));
      if (isNaN(qty) || qty <= 0) {
        throw new Error('Invalid item quantity.');
      }

      var dbProd = productMap[reqItem.product_id];
      if (!dbProd || dbProd.status !== 'active') {
        throw new Error('Product unavailable: ' + reqItem.product_id);
      }
      if (Number(dbProd.stock) < qty) {
        throw new Error('Insufficient stock for ' + dbProd.name + ' (available: ' + dbProd.stock + ')');
      }

      var unitPrice = Number(dbProd.price);
      var lineGross = unitPrice * qty;
      var itemDisc =
        settings.enable_discounts === false
          ? 0
          : computeServerDiscount(lineGross, reqItem.discount);
      var lineTotal = Math.max(0, lineGross - itemDisc);

      rawSubtotal += lineGross;
      totalItemDiscounts += itemDisc;

      verifiedItems.push({
        dbRow: dbProd,
        product_id: dbProd.product_id,
        product_name: dbProd.name,
        sku: dbProd.sku,
        quantity: qty,
        price: unitPrice,
        discount: itemDisc,
        line_total: lineTotal
      });
    }

    var afterItemDisc = Math.max(0, rawSubtotal - totalItemDiscounts);
    var txDisc =
      settings.enable_discounts === false
        ? 0
        : computeServerDiscount(afterItemDisc, payload.transactionDiscount);
    var totalDiscount = totalItemDiscounts + txDisc;
    var grandTotal = Math.max(0, afterItemDisc - txDisc);

    var paymentMethod = String(payload.payment_method || 'Cash');
    var amountPaid =
      paymentMethod === 'Cash'
        ? Number(payload.amount_paid || 0)
        : Number(payload.amount_paid || grandTotal);

    if (paymentMethod === 'Cash' && amountPaid < grandTotal) {
      throw new Error('Cash amount paid is less than grand total.');
    }
    var changeAmount = paymentMethod === 'Cash' ? Math.max(0, amountPaid - grandTotal) : 0;

    // 2. Kurangi stok produk
    var prodSheet = ss.getSheetByName('Products');
    var nowIso = new Date().toISOString();
    for (var k = 0; k < verifiedItems.length; k++) {
      var vItem = verifiedItems[k];
      var nextStock = Number(vItem.dbRow.stock) - vItem.quantity;
      prodSheet.getRange(vItem.dbRow._rowIndex, 8).setValue(nextStock);
      prodSheet.getRange(vItem.dbRow._rowIndex, 12).setValue(nowIso);
    }

    // 3. Perbarui poin member jika aktif
    var memberId = String(payload.member_id || '').trim();
    var memberName = '';
    var pointsEarned =
      settings.enable_member_points !== false ? Math.floor(grandTotal / 10000) : 0;

    if (memberId) {
      var memberRows = sheetToObjects('Members');
      for (var m = 0; m < memberRows.length; m++) {
        if (memberRows[m].member_id === memberId) {
          memberName = memberRows[m].name;
          if (settings.enable_member_points !== false && pointsEarned > 0) {
            var nextPts = Number(memberRows[m].points || 0) + pointsEarned;
            ss.getSheetByName('Members')
              .getRange(memberRows[m]._rowIndex, 6)
              .setValue(nextPts);
          }
          break;
        }
      }
    }

    // 4. Simpan header transaksi & detail item transaksi
    var dateStamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() || 'Asia/Jakarta',
      'yyyyMMdd'
    );
    var txId = 'TRX-' + dateStamp + '-' + Math.floor(1000 + Math.random() * 9000);

    var txRecord = {
      transaction_id: txId,
      date: nowIso,
      cashier: String(payload.cashier || 'Cashier'),
      member_id: memberId,
      member_name: memberName,
      subtotal: rawSubtotal,
      discount: totalDiscount,
      total: grandTotal,
      payment_method: paymentMethod,
      amount_paid: amountPaid,
      change_amount: changeAmount,
      points_earned: pointsEarned
    };

    ss.getSheetByName('Transactions').appendRow([
      txRecord.transaction_id,
      txRecord.date,
      txRecord.cashier,
      txRecord.member_id,
      txRecord.subtotal,
      txRecord.discount,
      txRecord.total,
      txRecord.payment_method,
      txRecord.amount_paid,
      txRecord.change_amount
    ]);

    var itemSheet = ss.getSheetByName('TransactionItems');
    var rowsToInsert = [];
    var itemRecords = [];

    for (var idx = 0; idx < verifiedItems.length; idx++) {
      var it = verifiedItems[idx];
      var itId = generateId('ITM');
      rowsToInsert.push([
        itId,
        txId,
        it.product_id,
        it.product_name,
        it.sku,
        it.quantity,
        it.price,
        it.discount,
        it.line_total
      ]);
      itemRecords.push({
        item_id: itId,
        transaction_id: txId,
        product_id: it.product_id,
        product_name: it.product_name,
        sku: it.sku,
        quantity: it.quantity,
        price: it.price,
        discount: it.discount,
        line_total: it.line_total
      });
    }

    if (rowsToInsert.length > 0) {
      itemSheet
        .getRange(itemSheet.getLastRow() + 1, 1, rowsToInsert.length, 9)
        .setValues(rowsToInsert);
    }

    return {
      transaction: txRecord,
      items: itemRecords
    };
  } finally {
    lock.releaseLock();
  }
}

function getTransactions() {
  var members = sheetToObjects('Members');
  var memberMap = {};
  for (var i = 0; i < members.length; i++) {
    memberMap[members[i].member_id] = members[i].name;
  }

  return sheetToObjects('Transactions')
    .map(function (t) {
      delete t._rowIndex;
      t.subtotal = Number(t.subtotal || 0);
      t.discount = Number(t.discount || 0);
      t.total = Number(t.total || 0);
      t.amount_paid = Number(t.amount_paid || 0);
      t.change_amount = Number(t.change_amount || 0);
      t.member_name = t.member_id ? memberMap[t.member_id] || '' : '';
      return t;
    })
    .reverse();
}

function getTransactionDetails(payload) {
  var txId = String((payload && payload.transaction_id) || '').trim();
  var allTx = getTransactions();
  var tx = null;
  for (var i = 0; i < allTx.length; i++) {
    if (allTx[i].transaction_id === txId) {
      tx = allTx[i];
      break;
    }
  }
  if (!tx) throw new Error('Transaction not found.');

  var items = sheetToObjects('TransactionItems')
    .filter(function (it) {
      return it.transaction_id === txId;
    })
    .map(function (it) {
      delete it._rowIndex;
      it.quantity = Number(it.quantity || 0);
      it.price = Number(it.price || 0);
      it.discount = Number(it.discount || 0);
      it.line_total = Number(it.line_total || 0);
      return it;
    });

  return { transaction: tx, items: items };
}
