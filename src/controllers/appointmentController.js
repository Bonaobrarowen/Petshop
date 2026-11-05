const { Appointment } = require('../models');
const { bad } = require('../middleware/auth');
const crud = require('./crud');
const validateDate = d => {
  if (d.price !== undefined && (Number(d.price) < 120 || !Number.isFinite(Number(d.price)))) {
    throw bad('Grooming price must be at least PHP 120');
  }
  if (!d.appointment_date) return;
  const appointment = new Date(d.appointment_date);
  if (Number.isNaN(appointment.getTime())) throw bad('Enter a valid appointment date and time');
  if (appointment.getTime() < Date.now()) throw bad('Appointment date and time cannot be in the past');
};
const base = crud(Appointment);
module.exports = {
  list: base.list,
  create(q, s) {
    validateDate(q.body);
    base.create(q, s);
  },
  update(q, s) {
    validateDate(q.body);
    base.update(q, s);
  },
  remove: base.remove
};
