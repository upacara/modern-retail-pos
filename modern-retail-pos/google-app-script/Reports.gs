function getSettings() {
  var rows = sheetToObjects('Settings');
  var obj = {};
  for (var i = 0; i < rows.length; i++) {
    var k = rows[i].key;
    var v = rows[i].value;
    if (v === 'true' || v === true) obj[k] = true;
    else if (v === 'false' || v === false) obj[k] = false;
    else if (k === 'low_stock_threshold') obj[k] = Number(v || 10);
    else obj[k] = v;
  }
  return obj;
}

function updateSettings(payload) {
  var sheet = getSpreadsheet().getSheetByName('Settings');
  var rows = sheetToObjects('Settings');
  var rowMap = {};
  for (var i = 0; i < rows.length; i++) {
    rowMap[rows[i].key] = rows[i]._rowIndex;
  }

  var keys = Object.keys(payload || {});
  for (var j = 0; j < keys.length; j++) {
    var key = keys[j];
    var val = String(payload[key]);
    if (rowMap[key]) {
      sheet.getRange(rowMap[key], 2).setValue(val);
    } else {
      sheet.appendRow([key, val]);
    }
  }
  return getSettings();
}

function getReports() {
  var txs = sheetToObjects('Transactions');
  var items = sheetToObjects('TransactionItems');
  var tz = Session.getScriptTimeZone() || 'Asia/Jakarta';
  var todayStr = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');

  var todayTxIds = {};
  var todaySales = 0;
  var totalTransactions = 0;
  var paymentMap = {};
  var dailyMap = {};

  for (var i = 0; i < txs.length; i++) {
    var t = txs[i];
    var dStr = String(t.date).slice(0, 10);
    var total = Number(t.total || 0);

    if (dStr === todayStr) {
      todayTxIds[t.transaction_id] = true;
      todaySales += total;
      totalTransactions += 1;
    }

    var method = t.payment_method || 'Other';
    paymentMap[method] = (paymentMap[method] || 0) + total;

    if (!dailyMap[dStr]) dailyMap[dStr] = { date: dStr, transactions: 0, sales: 0 };
    dailyMap[dStr].transactions += 1;
    dailyMap[dStr].sales += total;
  }

  var totalItemsSold = 0;
  var productMap = {};

  for (var j = 0; j < items.length; j++) {
    var it = items[j];
    var qty = Number(it.quantity || 0);
    var rev = Number(it.line_total || 0);

    if (todayTxIds[it.transaction_id]) {
      totalItemsSold += qty;
    }

    if (!productMap[it.product_id]) {
      productMap[it.product_id] = {
        product_id: it.product_id,
        product_name: it.product_name,
        sku: it.sku,
        quantity: 0,
        revenue: 0
      };
    }
    productMap[it.product_id].quantity += qty;
    productMap[it.product_id].revenue += rev;
  }

  var paymentBreakdown = Object.keys(paymentMap).map(function (m) {
    return { method: m, total: paymentMap[m] };
  });

  var bestSellingProducts = Object.keys(productMap)
    .map(function (id) {
      return productMap[id];
    })
    .sort(function (a, b) {
      return b.quantity - a.quantity;
    })
    .slice(0, 6);

  var dailySales = Object.keys(dailyMap)
    .sort()
    .slice(-7)
    .map(function (d) {
      return dailyMap[d];
    });

  return {
    todaySales: todaySales,
    totalTransactions: totalTransactions,
    totalItemsSold: totalItemsSold,
    avgTransactionValue: totalTransactions > 0 ? Math.round(todaySales / totalTransactions) : 0,
    paymentBreakdown: paymentBreakdown,
    bestSellingProducts: bestSellingProducts,
    dailySales: dailySales
  };
}
