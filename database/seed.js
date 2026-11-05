const bcrypt = require('bcryptjs');
const { db } = require('../config/database');

const seed = db.transaction(() => {
  db.exec(`
    DELETE FROM payment;
    DELETE FROM sales_details;
    DELETE FROM sales;
    DELETE FROM grooming_appointment;
    DELETE FROM authorized_pet_pickup;
    DELETE FROM pet;
    DELETE FROM customer;
    DELETE FROM product_inventory;
  `);

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO user_account (user_id, username, password_hash, full_name, role, status)
    VALUES (?, ?, ?, ?, ?, 'Active')
  `);
  insertUser.run(1, 'admin', bcrypt.hashSync('admin123', 10), 'System Administrator', 'Administrator');
  insertUser.run(2, 'staff_anna', bcrypt.hashSync('staff123', 10), 'Anna Reyes', 'Staff');
  insertUser.run(3, 'staff_mark', bcrypt.hashSync('staff123', 10), 'Mark Santos', 'Staff');

  const insertCustomer = db.prepare(`
    INSERT OR REPLACE INTO customer (customer_id, customer_identity, full_name, phone, email, address)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertCustomer.run(1, 'CUST-0001', 'Juan Dela Cruz', '09171234567', 'juan@gmail.com', '123 Main St, Manila');
  insertCustomer.run(2, 'CUST-0002', 'Maria Clara', '09189876543', 'maria@gmail.com', '456 Sampaguita St, Quezon City');
  insertCustomer.run(3, 'CUST-0003', 'Pedro Penduko', '09195551234', 'pedro@gmail.com', '789 Mabini St, Makati');
  const additionalCustomers = [
    ['CUST-0004', 'Ana Santos', '09181234501', 'ana.santos@gmail.com', '12 Rizal Ave, Pasig'],
    ['CUST-0005', 'Carlo Mendoza', '09181234502', 'carlo.mendoza@gmail.com', '25 Luna St, Taguig'],
    ['CUST-0006', 'Bea Garcia', '09181234503', 'bea.garcia@gmail.com', '8 Mabini St, Makati'],
    ['CUST-0007', 'Luis Villanueva', '09181234504', 'luis.v@gmail.com', '34 Bonifacio St, Manila'],
    ['CUST-0008', 'Nina Flores', '09181234505', 'nina.flores@gmail.com', '17 Scout Road, Quezon City'],
    ['CUST-0009', 'Ryan Torres', '09181234506', 'ryan.torres@gmail.com', '56 Market Ave, Pasay'],
    ['CUST-0010', 'Kate Rivera', '09181234507', 'kate.rivera@gmail.com', '91 Oak St, Las Pinas']
  ];
  additionalCustomers.forEach((customer, index) => insertCustomer.run(index + 4, ...customer));

  const insertPet = db.prepare(`
    INSERT INTO pet (pet_id, customer_id, name, species, breed, age)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertPet.run(1, 1, 'Buddy', 'Dog', 'Golden Retriever', 3);
  insertPet.run(2, 1, 'Milo', 'Cat', 'Siamese', 2);
  insertPet.run(3, 2, 'Bella', 'Dog', 'Poodle', 4);
  insertPet.run(4, 3, 'Luna', 'Cat', 'Persian', 1);

  const insertProduct = db.prepare(`
    INSERT INTO product_inventory
      (product_id, name, category, price, stock_quantity, reorder_level, barcode)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const products = [
    [1, 'Premium Adult Dog Food (5kg)', 'Food', 650, 15, 5, 'PET100001'],
    [2, 'Kitten Milk Replacer (300g)', 'Food', 350, 3, 5, 'PET100002'],
    [3, 'Anti-Tick & Flea Dog Shampoo', 'Grooming', 280, 12, 4, 'PET100003'],
    [4, 'Stainless Steel Pet Bowl', 'Accessories', 150, 25, 10, 'PET100004'],
    [5, 'Chewable Dental Treats (Pack)', 'Treats', 120, 2, 5, 'PET100005'],
    [6, 'Cat Scratching Post', 'Accessories', 850, 6, 2, 'PET100006'],
    [7, 'De-shedding Pet Brush', 'Grooming', 220, 8, 3, 'PET100007']
  ];
  products.forEach(product => insertProduct.run(...product));

  const insertAppointment = db.prepare(`
    INSERT INTO grooming_appointment
      (appointment_id, pet_id, service, appointment_date, price, status)
    VALUES (?, ?, ?, ?, ?, 'Scheduled')
  `);
  insertAppointment.run(1, 1, 'Full Grooming Package', '2026-11-06 10:00', 850);
  insertAppointment.run(2, 3, 'Basic Shower & Blow Dry', '2026-11-06 11:30', 450);
  insertAppointment.run(3, 2, 'Anti-Flea & Tick Treatment', '2026-11-06 14:00', 350);
  insertAppointment.run(4, 4, 'Nail Trimming & Filing', '2026-11-06 15:30', 150);

  const insertPickup = db.prepare(`
    INSERT INTO authorized_pet_pickup
      (pickup_id, pet_id, person_name, relationship, contact, id_presented, authorization_status)
    VALUES (?, ?, ?, ?, ?, 1, ?)
  `);
  insertPickup.run(1, 1, 'Clara Dela Cruz', 'Authorized representative', '09170001122', 'Verified');
  insertPickup.run(2, 3, 'Jose Clara', 'Authorized representative', '09181112233', 'Verified');

  const insertSale = db.prepare(`
    INSERT INTO sales (sale_id, customer_id, user_id, sale_date, total_amount)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertSaleDetail = db.prepare(`
    INSERT INTO sales_details (sale_id, product_id, quantity, unit_price, subtotal)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertPayment = db.prepare(`
    INSERT INTO payment (sale_id, amount, method, account_name, reference_number, status, paid_at)
    VALUES (?, ?, ?, ?, ?, 'Paid', ?)
  `);
  const sampleSales = [
    [1, 1, 650, 1, 'Cash', '2026-11-05 09:15:00'],
    [2, 2, 280, 3, 'GCash', '2026-11-05 10:05:00'],
    [3, 3, 150, 4, 'Cash', '2026-11-05 10:40:00'],
    [4, 4, 350, 2, 'Card', '2026-11-05 11:20:00'],
    [5, 5, 120, 5, 'Cash', '2026-11-05 12:10:00'],
    [6, 6, 850, 6, 'GCash', '2026-11-05 13:25:00'],
    [7, 7, 220, 7, 'Cash', '2026-11-05 14:00:00'],
    [8, 8, 650, 1, 'Card', '2026-11-05 14:45:00'],
    [9, 9, 280, 3, 'GCash', '2026-11-05 15:20:00'],
    [10, 10, 150, 4, 'Cash', '2026-11-05 16:05:00']
  ];
  sampleSales.forEach(([saleId, customerId, unitPrice, productId, method, saleDate]) => {
    insertSale.run(saleId, customerId, saleId % 2 ? 2 : 3, saleDate, unitPrice);
    insertSaleDetail.run(saleId, productId, 1, unitPrice, unitPrice);
    const accountName = method === 'GCash' ? 'Sample GCash' : null;
    const referenceNumber = method === 'GCash' ? String(1002938475600 + saleId) : null;
    insertPayment.run(saleId, unitPrice, method, accountName, referenceNumber, saleDate);
  });
});

seed();

console.log('Sample data loaded successfully.');
console.log(JSON.stringify({
  users: db.prepare('SELECT COUNT(*) AS count FROM user_account').get().count,
  customers: db.prepare('SELECT COUNT(*) AS count FROM customer').get().count,
  pets: db.prepare('SELECT COUNT(*) AS count FROM pet').get().count,
  products: db.prepare('SELECT COUNT(*) AS count FROM product_inventory').get().count,
  appointments: db.prepare('SELECT COUNT(*) AS count FROM grooming_appointment').get().count,
  pickups: db.prepare('SELECT COUNT(*) AS count FROM authorized_pet_pickup').get().count,
  sales: db.prepare('SELECT COUNT(*) AS count FROM sales').get().count,
  customers_with_sales: db.prepare('SELECT COUNT(DISTINCT customer_id) AS count FROM sales').get().count
}));
