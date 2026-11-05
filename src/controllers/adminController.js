const fs = require('fs'), path = require('path');
const { db, file } = require('../../config/database'), app = require('../../config/app_config'), { bad } = require('../middleware/auth');
const dir = path.join(__dirname, '..', '..', 'database', 'backups');
exports.backup = async (q, s) => {
  const f = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
  await db.backup(path.join(dir, f)); app.log(`Backup ${f} by ${q.user.name}`); s.json({ file: f });
};
exports.list = (q, s) => s.json(fs.readdirSync(dir).filter(f => f.endsWith('.db')).sort().reverse());
exports.restore = (q, s) => {
  const src = path.join(dir, path.basename(q.body.file || ''));
  if (!fs.existsSync(src)) throw bad('Backup not found', 404);
  fs.copyFileSync(src, file + '.restore'); app.log(`Restore of ${path.basename(src)} staged by ${q.user.name}`);
  s.json({ message: 'Restore staged. Restart the server to apply it.' });
};
exports.logs = (q, s) => {
  const p = path.join(app.logsDir, q.query.file === 'error' ? 'error.log' : 'system.log');
  s.json({ lines: fs.existsSync(p) ? fs.readFileSync(p, 'utf8').trim().split('\n').slice(-100).reverse() : [] });
};
