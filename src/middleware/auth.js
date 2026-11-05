const jwt = require('jsonwebtoken'), cfg = require('../../config/auth'), app = require('../../config/app_config');
const bad = (message, status = 400) => Object.assign(new Error(message), { status });
exports.bad = bad;
exports.auth = (q, s, n) => { // authMiddleware: verifies the bearer token
  try { q.user = jwt.verify((q.headers.authorization || '').replace('Bearer ', ''), cfg.secret); n(); }
  catch { s.status(401).json({ error: 'Please sign in' }); }
};
exports.role = r => (q, s, n) => q.user.role === r ? n() : s.status(403).json({ error: `${r} access required` }); // roleMiddleware
exports.errorHandler = (e, q, s, n) => {
  const status = e.status || (/constraint/i.test(e.message) ? 400 : 500);
  if (status === 500) app.log(`${q.method} ${q.url} ${e.stack}`, 'error.log');
  s.status(status).json({ error: status === 500 ? 'Something went wrong' : e.message });
};
