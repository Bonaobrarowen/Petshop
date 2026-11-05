const { db } = require('../../config/database'), app = require('../../config/app_config'), { bad } = require('../middleware/auth');
exports.checkout = (q, s) => {
  const { customer_id, items, method = 'Cash', account_name = '', reference_number = '' } = q.body;
  if (!Array.isArray(items) || !items.length) throw bad('The cart is empty');
  const run = db.transaction(() => { // all-or-nothing: sale, lines, stock and payment
    let total = 0;
    const lines = items.map(i => {
      const p = db.prepare('SELECT * FROM product_inventory WHERE product_id=?').get(i.product_id), n = parseInt(i.quantity, 10);
      if (!p || !(n > 0)) throw bad('Invalid item in cart');
      if (p.stock_quantity < n) throw bad(`Not enough stock for ${p.name} (${p.stock_quantity} left)`);
      total += p.price * n; return { p, n };
    });
    const sid = db.prepare('INSERT INTO sales(customer_id,user_id,total_amount) VALUES (?,?,?)').run(customer_id || null, q.user.id, total).lastInsertRowid;
    for (const { p, n } of lines) {
      db.prepare('INSERT INTO sales_details(sale_id,product_id,quantity,unit_price,subtotal) VALUES (?,?,?,?,?)').run(sid, p.product_id, n, p.price, p.price * n);
      db.prepare('UPDATE product_inventory SET stock_quantity=stock_quantity-? WHERE product_id=?').run(n, p.product_id);
    }
    if (method === 'GCash') {
      if (!String(account_name).trim()) throw bad('GCash account name is required');
      if (!/^\d{13}$/.test(String(reference_number).trim())) throw bad('GCash reference number must be 13 digits');
    }
    db.prepare("INSERT INTO payment(sale_id,amount,method,account_name,reference_number,status) VALUES (?,?,?,?,?, 'Paid')")
      .run(sid, total, method, method === 'GCash' ? String(account_name).trim() : null, method === 'GCash' ? String(reference_number).trim() : null);
    return { sale_id: sid, total };
  });
  const r = run(); app.log(`Sale #${r.sale_id} total ${r.total} by ${q.user.name}`); s.status(201).json(r);
};
exports.history = (q, s) => s.json(db.prepare(`SELECT s.sale_id, s.sale_date, s.total_amount,
  COALESCE((SELECT GROUP_CONCAT(pi.name, ', ')
    FROM sales_details sd JOIN product_inventory pi ON pi.product_id=sd.product_id
    WHERE sd.sale_id=s.sale_id),'') AS sold_products,
  CASE WHEN s.customer_id IS NULL OR (SELECT method FROM payment WHERE sale_id=s.sale_id LIMIT 1)='Cash' THEN 'Walk-in' ELSE COALESCE(c.full_name,'Walk-in') END AS customer,
  u.full_name AS cashier,
  CASE WHEN s.customer_id IS NULL OR (SELECT method FROM payment WHERE sale_id=s.sale_id LIMIT 1)='Cash' THEN '' ELSE COALESCE(c.phone,'') END AS customer_phone,
  CASE WHEN (SELECT method FROM payment WHERE sale_id=s.sale_id LIMIT 1)='Cash' THEN '' ELSE COALESCE((SELECT GROUP_CONCAT(p.name, ', ') FROM pet p WHERE p.customer_id=c.customer_id),'') END AS customer_pets,
  CASE WHEN (SELECT method FROM payment WHERE sale_id=s.sale_id LIMIT 1)='GCash'
       THEN (SELECT reference_number FROM payment WHERE sale_id=s.sale_id LIMIT 1) ELSE NULL END AS reference_number,
  (SELECT method FROM payment WHERE sale_id=s.sale_id LIMIT 1) AS method
  FROM sales s LEFT JOIN customer c ON c.customer_id=s.customer_id JOIN user_account u ON u.user_id=s.user_id ORDER BY s.sale_id DESC LIMIT 100`).all());
exports.lowStock = (q, s) => s.json(db.prepare('SELECT * FROM product_inventory WHERE stock_quantity <= reorder_level ORDER BY stock_quantity').all());
exports.dashboard = (q, s) => s.json(db.prepare(`SELECT
  (SELECT COUNT(*) FROM customer) AS customers, (SELECT COUNT(*) FROM pet) AS pets,
  (SELECT COUNT(*) FROM grooming_appointment WHERE status='Scheduled' AND date(appointment_date)=date('now','localtime')) AS appointments_today,
  (SELECT COUNT(*) FROM product_inventory WHERE stock_quantity <= reorder_level) AS low_stock,
  (SELECT COALESCE(SUM(total_amount),0) FROM sales WHERE date(sale_date)=date('now','localtime')) AS sales_today`).get());
