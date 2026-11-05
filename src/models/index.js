const make = require('./model');
const { db } = require('../../config/database');
const User = make('user_account', 'user_id', ['username', 'password_hash', 'full_name', 'role', 'status']);
const safe = 'user_id,username,full_name,role,status'; // never expose password hashes
User.all = () => db.prepare(`SELECT ${safe} FROM user_account ORDER BY user_id`).all();
User.get = id => db.prepare(`SELECT ${safe} FROM user_account WHERE user_id=?`).get(id);
User.byName = u => db.prepare('SELECT * FROM user_account WHERE username=?').get(u);
module.exports = {
  User,
  Customer: make('customer', 'customer_id', ['customer_identity', 'full_name', 'phone', 'email', 'address']),
  Pet: make('pet', 'pet_id', ['customer_id', 'name', 'species', 'breed', 'age']),
  Product: make('product_inventory', 'product_id', ['name', 'category', 'price', 'stock_quantity', 'reorder_level', 'barcode']),
  Appointment: make('grooming_appointment', 'appointment_id', ['pet_id', 'service', 'appointment_date', 'price', 'status']),
  Payment: make('payment', 'payment_id', ['sale_id', 'appointment_id', 'amount', 'method', 'account_name', 'reference_number', 'status']),
  Pickup: make('authorized_pet_pickup', 'pickup_id', ['pet_id', 'person_name', 'relationship', 'contact', 'id_presented', 'authorization_status', 'released_at', 'verified_by'])
};
