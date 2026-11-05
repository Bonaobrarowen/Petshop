const bcrypt = require('bcryptjs'), { User } = require('../models');
module.exports = require('./crud')(User, d => ({ ...d, ...(d.password ? { password_hash: bcrypt.hashSync(d.password, 10) } : {}) }));
