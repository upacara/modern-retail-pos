function jsonResponse(success, message, data) {
  var payload = {
    success: Boolean(success),
    message: String(message || ''),
    data: data === undefined ? null : data
  };
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function generateId(prefix) {
  var rand = Math.floor(1000 + Math.random() * 9000);
  return prefix + '-' + new Date().getTime() + '-' + rand;
}

function getSigningSecret() {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('AUTH_SIGNING_SECRET');
  if (!secret) {
    secret = Utilities.getUuid() + '-' + Utilities.getUuid();
    props.setProperty('AUTH_SIGNING_SECRET', secret);
  }
  return secret;
}

function hashPassword(plainText) {
  var salt = getSigningSecret();
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    salt + ':' + String(plainText)
  );
  return digest
    .map(function (b) {
      var v = b < 0 ? b + 256 : b;
      return ('0' + v.toString(16)).slice(-2);
    })
    .join('');
}

function createSessionToken(userObj) {
  var payload = {
    user_id: userObj.user_id,
    name: userObj.name,
    username: userObj.username,
    role: userObj.role,
    exp: new Date().getTime() + 12 * 60 * 60 * 1000
  };
  var encoded = Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  var sigBytes = Utilities.computeHmacSha256Signature(encoded, getSigningSecret());
  var sig = Utilities.base64EncodeWebSafe(sigBytes);
  return encoded + '.' + sig;
}

function verifySessionToken(token) {
  if (!token || String(token).indexOf('.') === -1) return null;
  var parts = String(token).split('.');
  var encoded = parts[0];
  var sig = parts[1];

  var expectedBytes = Utilities.computeHmacSha256Signature(encoded, getSigningSecret());
  var expectedSig = Utilities.base64EncodeWebSafe(expectedBytes);
  if (sig !== expectedSig) return null;

  var decoded = Utilities.newBlob(Utilities.base64DecodeWebSafe(encoded)).getDataAsString();
  var payload = JSON.parse(decoded);
  if (!payload.exp || new Date().getTime() > payload.exp) return null;
  return payload;
}

function sheetToObjects(sheetName) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    obj._rowIndex = i + 1;
    rows.push(obj);
  }
  return rows;
}
