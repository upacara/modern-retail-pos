function authenticateUser(payload) {
  var username = String((payload && payload.username) || '')
    .trim()
    .toLowerCase();
  var password = String((payload && payload.password) || '');

  if (!username || !password) {
    throw new Error('Username and password are required.');
  }

  var users = sheetToObjects('Users');
  var hashed = hashPassword(password);

  var found = null;
  for (var i = 0; i < users.length; i++) {
    if (
      String(users[i].username).toLowerCase() === username &&
      String(users[i].password_hash) === hashed &&
      String(users[i].status) === 'active'
    ) {
      found = users[i];
      break;
    }
  }

  if (!found) {
    throw new Error('Invalid username, password, or inactive user.');
  }

  var userSafe = {
    user_id: found.user_id,
    name: found.name,
    username: found.username,
    role: found.role
  };

  return {
    token: createSessionToken(userSafe),
    user: userSafe
  };
}

function requireAuth(token, allowedRoles) {
  var user = verifySessionToken(token);
  if (!user) {
    throw new Error('Unauthorized: Valid session token required. Please sign in via header profile.');
  }
  if (allowedRoles && allowedRoles.indexOf(user.role) === -1) {
    throw new Error('Forbidden: Role "' + user.role + '" is not authorized for this action.');
  }
  return user;
}
