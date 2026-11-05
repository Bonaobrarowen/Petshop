const { db } = require('../../config/database');
const { bad } = require('../middleware/auth');

const prices = {
  'Full Grooming Package': 850,
  'Basic Shower & Blow Dry': 450,
  'Nail Trimming & Filing': 150,
  'Ear Cleaning & Plucking': 150,
  'Anti-Flea & Tick Treatment': 350,
  'De-Shedding & De-Matting': 300,
  'Teeth Brushing & Breath Care': 120,
  'Puppy / Kitten First Bath': 300
};

exports.create = (q, s) => {
  const fullName = String(q.body.full_name || '').trim();
  const phone = String(q.body.phone || '').trim();
  const petName = String(q.body.pet_name || '').trim();
  const breed = String(q.body.breed || '').trim();
  const age = Number(q.body.age);
  const service = String(q.body.service || '').trim();
  const appointmentDate = new Date(q.body.appointment_date);

  if (!fullName || !phone || !petName || !service) throw bad('Complete all required fields');
  if (!/^09\d{9}$/.test(phone)) throw bad('Enter a valid 11-digit Philippine mobile number');
  if (!prices[service]) throw bad('Select a valid grooming service');
  if (!Number.isFinite(age) || age < 0) throw bad('Enter a valid dog age');
  if (Number.isNaN(appointmentDate.getTime()) || appointmentDate.getTime() <= Date.now()) {
    throw bad('Appointment date and time cannot be in the past');
  }

  const booking = db.transaction(() => {
    let customer = db.prepare(
      'SELECT * FROM customer WHERE lower(full_name)=lower(?) AND phone=? LIMIT 1'
    ).get(fullName, phone);

    if (!customer) {
      const next = db.prepare('SELECT COALESCE(MAX(customer_id), 0) + 1 AS id FROM customer').get().id;
      const result = db.prepare(
        'INSERT INTO customer(customer_identity, full_name, phone, email, address) VALUES (?, ?, ?, ?, ?)'
      ).run(`CUST-${String(next).padStart(4, '0')}`, fullName, phone,
        String(q.body.email || '').trim(), String(q.body.address || '').trim());
      customer = db.prepare('SELECT * FROM customer WHERE customer_id=?').get(result.lastInsertRowid);
    }

    let pet = db.prepare(
      'SELECT * FROM pet WHERE customer_id=? AND lower(name)=lower(?) LIMIT 1'
    ).get(customer.customer_id, petName);

    if (!pet) {
      const result = db.prepare(
        'INSERT INTO pet(customer_id, name, species, breed, age) VALUES (?, ?, ?, ?, ?)'
      ).run(customer.customer_id, petName, 'Dog', breed, age);
      pet = db.prepare('SELECT * FROM pet WHERE pet_id=?').get(result.lastInsertRowid);
    }

    const date = appointmentDate.toISOString().slice(0, 19).replace('T', ' ');
    const result = db.prepare(
      `INSERT INTO grooming_appointment(pet_id, service, appointment_date, price, status)
       VALUES (?, ?, ?, ?, 'Pending')`
    ).run(pet.pet_id, service, date, prices[service]);

    return { appointment_id: result.lastInsertRowid, customer_id: customer.customer_id, pet_id: pet.pet_id };
  });

  s.status(201).json({ ...booking(), message: 'Appointment request submitted. Please wait for staff approval.' });
};
