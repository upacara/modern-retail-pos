function doGet(e) {
  ensureDatabaseReady();
  return jsonResponse(true, 'Kassa POS API is online.', {
    timestamp: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    ensureDatabaseReady();

    var rawBody = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var req = JSON.parse(rawBody);
    var action = req.action;
    var payload = req.payload || {};
    var token = req.token || '';

    var result;

    switch (action) {
      case 'authenticateUser':
        result = authenticateUser(payload);
        break;
      case 'getProducts':
        result = getProducts();
        break;
      case 'searchProducts':
        result = searchProducts(payload);
        break;
      case 'createProduct':
        requireAuth(token, ['admin', 'manager']);
        result = createProduct(payload);
        break;
      case 'updateProduct':
        requireAuth(token, ['admin', 'manager']);
        result = updateProduct(payload);
        break;
      case 'updateStock':
        requireAuth(token, ['admin', 'manager', 'cashier']);
        result = updateStock(payload);
        break;
      case 'deleteProduct':
        requireAuth(token, ['admin']);
        result = deleteProduct(payload);
        break;
      case 'getMembers':
        result = getMembers();
        break;
      case 'searchMembers':
        result = searchMembers(payload);
        break;
      case 'createMember':
        result = createMember(payload);
        break;
      case 'updateMember':
        result = updateMember(payload);
        break;
      case 'createTransaction':
        result = createTransaction(payload);
        break;
      case 'getTransactions':
        result = getTransactions();
        break;
      case 'getTransactionDetails':
        result = getTransactionDetails(payload);
        break;
      case 'getReports':
        result = getReports();
        break;
      case 'getSettings':
        result = getSettings();
        break;
      case 'updateSettings':
        requireAuth(token, ['admin']);
        result = updateSettings(payload);
        break;
      default:
        return jsonResponse(false, 'Unknown API action: ' + action, null);
    }

    return jsonResponse(true, 'Operation successful', result);
  } catch (err) {
    return jsonResponse(false, err.message || 'Unexpected server error', null);
  }
}
