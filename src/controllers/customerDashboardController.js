const { db } = require('../../config/database');
const { bad } = require('../middleware/auth');

exports.profile = (q, s) => {
  if (q.user.role !== 'Customer') throw bad('Customer account required', 403);
  const customerId = db.prepare('SELECT customer_id FROM user_account WHERE user_id=?').get(q.user.id)?.customer_id;
  const customer = customerId && db.prepare('SELECT * FROM customer WHERE customer_id=?').get(customerId);
  if (!customer) throw bad('Customer profile was not found', 404);
  s.json(customer);
};

exports.appointments = (q, s) => {
  if (q.user.role !== 'Customer') throw bad('Customer account required', 403);
  const customerId = db.prepare('SELECT customer_id FROM user_account WHERE user_id=?').get(q.user.id)?.customer_id;
  if (!customerId) return s.json([]);
  const rows = db.prepare(`
    SELECT a.appointment_id, p.name AS pet_name, a.service, a.appointment_date, a.price, a.status
    FROM grooming_appointment a
    JOIN pet p ON p.pet_id=a.pet_id
    WHERE p.customer_id=?
    ORDER BY a.appointment_date DESC
  `).all(customerId);
  s.json(rows);
};

exports.createAppointment = require('./publicBookingController').create;
