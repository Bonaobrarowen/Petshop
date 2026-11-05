require('dotenv').config();
module.exports = { secret: process.env.JWT_SECRET || 'change-this-secret', expiresIn: '8h' };
