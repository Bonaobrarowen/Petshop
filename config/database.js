require('dotenv').config();
const Database = require('better-sqlite3'), fs = require('fs'), path = require('path'), bcrypt = require('bcryptjs');
const file = path.join(__dirname, '..', 'database', 'petshop.db');
if (fs.existsSync(file + '.restore')) fs.renameSync(file + '.restore', file); // staged restore
const db = new Database(file);
db.pragma('foreign_keys = ON');
db.exec(fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8'));
const customerColumns = db.prepare("PRAGMA table_info(customer)").all();
if (!customerColumns.some(c => c.name === 'customer_identity')) {
  db.exec('ALTER TABLE customer ADD COLUMN customer_identity TEXT');
  for (const customer of db.prepare('SELECT customer_id FROM customer ORDER BY customer_id').all()) {
    db.prepare('UPDATE customer SET customer_identity=? WHERE customer_id=?').run(`CUST-${String(customer.customer_id).padStart(4, '0')}`, customer.customer_id);
  }
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS customer_identity_unique ON customer(customer_identity)');
}
if (!db.prepare("PRAGMA table_info(product_inventory)").all().some(c => c.name === 'barcode')) {
  db.exec('ALTER TABLE product_inventory ADD COLUMN barcode TEXT');
}
const pickupColumns = db.prepare("PRAGMA table_info(authorized_pet_pickup)").all();
if (!pickupColumns.some(c => c.name === 'authorization_status')) {
  db.exec("ALTER TABLE authorized_pet_pickup ADD COLUMN authorization_status TEXT NOT NULL DEFAULT 'Pending'");
}
if (!db.prepare("PRAGMA table_info(payment)").all().some(c => c.name === 'reference_number')) {
  db.exec('ALTER TABLE payment ADD COLUMN reference_number TEXT');
}
if (!db.prepare("PRAGMA table_info(payment)").all().some(c => c.name === 'account_name')) {
  db.exec('ALTER TABLE payment ADD COLUMN account_name TEXT');
}
if (!db.prepare("PRAGMA table_info(pet)").all().some(c => c.name === 'pet_code')) {
  db.exec('ALTER TABLE pet ADD COLUMN pet_code TEXT');
}
const petColumns = db.prepare("PRAGMA table_info(pet)").all();
if (petColumns.some(c => c.name === 'pet_code')) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const used = new Set(db.prepare('SELECT pet_code FROM pet WHERE pet_code IS NOT NULL').all().map(p => p.pet_code));
  for (const pet of db.prepare('SELECT pet_id FROM pet WHERE pet_code IS NULL OR pet_code = ?').all('')) {
    let code;
    do {
      code = `P${Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')}`;
    } while (used.has(code));
    used.add(code);
    db.prepare('UPDATE pet SET pet_code=? WHERE pet_id=?').run(code, pet.pet_id);
  }
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS pet_code_unique ON pet(pet_code)');
}
if (!db.prepare('SELECT 1 FROM user_account').get()) { // seed default admin
  db.prepare('INSERT INTO user_account(username,password_hash,full_name,role) VALUES (?,?,?,?)')
    .run('admin', bcrypt.hashSync('admin123', 10), 'System Administrator', 'Administrator');
}
module.exports = { db, file };
