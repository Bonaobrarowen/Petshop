const { db } = require('../../config/database');

exports.customers = (q, s) => s.json(db.prepare(`
  SELECT c.customer_id, c.customer_identity, c.full_name, c.phone, c.email, c.address,
    COUNT(DISTINCT p.pet_id) AS pet_count,
    COUNT(DISTINCT a.appointment_id) AS grooming_count,
    COUNT(DISTINCT s.sale_id) AS sales_count
  FROM customer c
  LEFT JOIN pet p ON p.customer_id=c.customer_id
  LEFT JOIN grooming_appointment a ON a.pet_id=p.pet_id
  LEFT JOIN sales s ON s.customer_id=c.customer_id
  GROUP BY c.customer_id
  ORDER BY c.customer_id DESC
`).all());

exports.pets = (q, s) => s.json(db.prepare(`
  SELECT p.pet_id, p.pet_code, p.customer_id, p.name, p.species, p.breed, p.age,
    c.customer_identity AS owner_customer_id, c.full_name AS owner_name, c.phone AS owner_phone
  FROM pet p
  JOIN customer c ON c.customer_id=p.customer_id
  ORDER BY p.pet_id DESC
`).all());

exports.appointments = (q, s) => s.json(db.prepare(`
  SELECT a.appointment_id, a.pet_id, p.pet_code, p.name AS pet_name,
    c.customer_id, c.customer_identity AS owner_customer_id, c.full_name AS owner_name, c.phone AS owner_phone,
    a.service, a.appointment_date, a.price, a.status
  FROM grooming_appointment a
  JOIN pet p ON p.pet_id=a.pet_id
  JOIN customer c ON c.customer_id=p.customer_id
  ORDER BY a.appointment_date DESC, a.appointment_id DESC
`).all());
