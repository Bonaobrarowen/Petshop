const { Product } = require('../models');
const crud = require('./crud');
const { bad } = require('../middleware/auth');
const PET_SHOP_CATEGORIES = ['Food', 'Grooming', 'Accessories', 'Treats', 'Health & Care', 'Toys', 'Cleaning & Hygiene', 'Pet Supplies'];
const validate = d => {
  if (d.category !== undefined && !PET_SHOP_CATEGORIES.includes(String(d.category).trim())) {
    throw bad(`Category must be one of: ${PET_SHOP_CATEGORIES.join(', ')}`);
  }
  for (const field of ['price', 'stock_quantity', 'reorder_level']) {
    if (d[field] === undefined) continue;
    const value = Number(d[field]);
    if (!Number.isFinite(value) || value < (field === 'price' ? 0.01 : 0)) {
      throw bad(field === 'price' ? 'Price must be greater than zero' : `${field.replace(/_/g, ' ')} cannot be negative`);
    }
    if (field !== 'price' && !Number.isInteger(value)) throw bad(`${field.replace(/_/g, ' ')} must be a whole number`);
  }
};
const base = crud(Product);
module.exports = {
  list: base.list,
  create(q, s) { validate(q.body); base.create(q, s); },
  update(q, s) { validate(q.body); base.update(q, s); },
  remove: base.remove
};
