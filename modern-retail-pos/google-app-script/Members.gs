function getMembers() {
  return sheetToObjects('Members').map(function (m) {
    delete m._rowIndex;
    m.points = Number(m.points || 0);
    m.phone = String(m.phone || '');
    return m;
  });
}

function searchMembers(payload) {
  var q = String((payload && payload.query) || '')
    .trim()
    .toLowerCase();
  var list = getMembers();
  if (!q) return list;
  return list.filter(function (m) {
    return (
      String(m.name).toLowerCase().indexOf(q) !== -1 || String(m.phone).indexOf(q) !== -1
    );
  });
}

function createMember(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var name = String(payload.name || '').trim();
    var phone = String(payload.phone || '').trim();
    if (!name || !phone) throw new Error('Member name and phone number are required.');

    var existing = getMembers();
    for (var i = 0; i < existing.length; i++) {
      if (String(existing[i].phone) === phone) {
        throw new Error('Phone number is already registered.');
      }
    }

    var member = {
      member_id: generateId('MBR'),
      name: name,
      phone: phone,
      email: String(payload.email || '').trim(),
      registered_at: new Date().toISOString(),
      points: 0,
      status: 'active'
    };

    getSpreadsheet()
      .getSheetByName('Members')
      .appendRow([
        member.member_id,
        member.name,
        member.phone,
        member.email,
        member.registered_at,
        member.points,
        member.status
      ]);

    return member;
  } finally {
    lock.releaseLock();
  }
}

function updateMember(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var memberId = String(payload.member_id || '').trim();
    var rows = sheetToObjects('Members');
    var target = null;

    for (var i = 0; i < rows.length; i++) {
      if (rows[i].member_id === memberId) {
        target = rows[i];
      } else if (payload.phone && String(rows[i].phone) === String(payload.phone).trim()) {
        throw new Error('Phone number is already used by another member.');
      }
    }

    if (!target) throw new Error('Member not found.');

    var updated = {
      member_id: memberId,
      name: payload.name !== undefined ? String(payload.name).trim() : target.name,
      phone: payload.phone !== undefined ? String(payload.phone).trim() : String(target.phone),
      email: payload.email !== undefined ? String(payload.email).trim() : target.email,
      registered_at: target.registered_at,
      points: payload.points !== undefined ? Number(payload.points) : Number(target.points || 0),
      status: payload.status !== undefined ? payload.status : target.status
    };

    getSpreadsheet()
      .getSheetByName('Members')
      .getRange(target._rowIndex, 1, 1, 7)
      .setValues([
        [
          updated.member_id,
          updated.name,
          updated.phone,
          updated.email,
          updated.registered_at,
          updated.points,
          updated.status
        ]
      ]);

    return updated;
  } finally {
    lock.releaseLock();
  }
}
