CREATE TABLE IF NOT EXISTS user_account (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Administrator','Staff')) DEFAULT 'Staff',
  status TEXT NOT NULL DEFAULT 'Active'
);
CREATE TABLE IF NOT EXISTS customer (
  customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_identity TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL, phone TEXT, email TEXT, address TEXT
);
CREATE TABLE IF NOT EXISTS pet (
  pet_id INTEGER PRIMARY KEY AUTOINCREMENT,
  pet_code TEXT UNIQUE,
  customer_id INTEGER NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  name TEXT NOT NULL, species TEXT, breed TEXT, age INTEGER
);
CREATE TABLE IF NOT EXISTS product_inventory (
  product_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, category TEXT,
  price REAL NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reorder_level INTEGER NOT NULL DEFAULT 5,
  barcode TEXT UNIQUE
);
CREATE TABLE IF NOT EXISTS sales (
  sale_id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER REFERENCES customer(customer_id),
  user_id INTEGER NOT NULL REFERENCES user_account(user_id),
  sale_date TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  total_amount REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS sales_details (
  detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL REFERENCES sales(sale_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES product_inventory(product_id),
  quantity INTEGER NOT NULL, unit_price REAL NOT NULL, subtotal REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS grooming_appointment (
  appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  pet_id INTEGER NOT NULL REFERENCES pet(pet_id) ON DELETE CASCADE,
  service TEXT NOT NULL, appointment_date TEXT NOT NULL, price REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Scheduled'
);
CREATE TABLE IF NOT EXISTS payment (
  payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER REFERENCES sales(sale_id),
  appointment_id INTEGER REFERENCES grooming_appointment(appointment_id),
  amount REAL NOT NULL, method TEXT NOT NULL DEFAULT 'Cash',
  account_name TEXT,
  reference_number TEXT,
  status TEXT NOT NULL DEFAULT 'Paid',
  paid_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS authorized_pet_pickup (
  pickup_id INTEGER PRIMARY KEY AUTOINCREMENT,
  pet_id INTEGER NOT NULL REFERENCES pet(pet_id) ON DELETE CASCADE,
  person_name TEXT NOT NULL, relationship TEXT, contact TEXT,
  id_presented INTEGER NOT NULL DEFAULT 0,
  authorization_status TEXT NOT NULL DEFAULT 'Pending' CHECK (authorization_status IN ('Pending','Verified','Rejected')),
  released_at TEXT, verified_by INTEGER REFERENCES user_account(user_id)
);
