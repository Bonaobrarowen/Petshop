const { db } = require('../../config/database');
// Minimal data-access object for one table (names come from trusted code, values are parameterised)
module.exports = (table, pk, fields) => ({
  all: () => db.prepare(`SELECT * FROM ${table} ORDER BY ${pk} DESC`).all(),
  get: id => db.prepare(`SELECT * FROM ${table} WHERE ${pk}=?`).get(id),
  create(d) {
    const f = fields.filter(k => d[k] !== undefined);
    return db.prepare(`INSERT INTO ${table}(${f.join()}) VALUES (${f.map(() => '?').join()})`).run(...f.map(k => d[k])).lastInsertRowid;
  },
  update(id, d) {
    const f = fields.filter(k => d[k] !== undefined);
    if (f.length) db.prepare(`UPDATE ${table} SET ${f.map(k => k + '=?').join()} WHERE ${pk}=?`).run(...f.map(k => d[k]), id);
  },
  remove: id => db.prepare(`DELETE FROM ${table} WHERE ${pk}=?`).run(id)
});
