const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const { User } = require('../models'), cfg = require('../../config/auth'), app = require('../../config/app_config'), { bad } = require('../middleware/auth');
const tokenFor = u => {
  const user = { id: u.user_id, name: u.full_name, role: u.role };
  return { token: jwt.sign(user, cfg.secret, { expiresIn: cfg.expiresIn }), user };
};
exports.login = (q, s) => {
  const u = User.byName(q.body.username || '');
  if (!u || u.status !== 'Active' || !bcrypt.compareSync(q.body.password || '', u.password_hash)) {
    app.log(`Failed login for "${q.body.username}"`); throw bad('Wrong username or password', 401);
  }
  app.log(`Login: ${u.username}`);
  s.json(tokenFor(u));
};
exports.signup = (q, s) => {
  const username = String(q.body.username || '').trim();
  const password = String(q.body.password || '');
  const fullName = String(q.body.fullName || '').trim();
  const phone = String(q.body.phone || '').trim();
  if (!username || !password || !fullName) throw bad('Full name, username, and password are required');
  if (username.length < 3) throw bad('Username must be at least 3 characters');
  if (password.length < 6) throw bad('Password must be at least 6 characters');
  if (User.byName(username)) throw bad('Username is already taken');
  const customer = require('../../config/database').db.prepare(
    'SELECT * FROM customer WHERE lower(full_name)=lower(?) AND (phone=? OR phone IS NULL OR phone=\'\') LIMIT 1'
  ).get(fullName, phone);
  let customerId = customer?.customer_id;
  if (!customerId) {
    const next = require('../../config/database').db.prepare('SELECT COALESCE(MAX(customer_id), 0)+1 AS id FROM customer').get().id;
    customerId = require('../../config/database').db.prepare(
      'INSERT INTO customer(customer_identity, full_name, phone, email, address) VALUES (?, ?, ?, ?, ?)'
    ).run(`CUST-${String(next).padStart(4, '0')}`, fullName, phone,
      String(q.body.email || '').trim(), String(q.body.address || '').trim()).lastInsertRowid;
  }
  const id = User.create({
    username,
    password_hash: bcrypt.hashSync(password, 10),
    full_name: fullName,
    role: 'Customer',
    customer_id: customerId,
    status: 'Active'
  });
  const u = User.byName(username);
  app.log(`Signup: ${u.username}`);
  s.status(201).json(tokenFor(u));
};
