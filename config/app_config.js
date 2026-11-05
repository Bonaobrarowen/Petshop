require('dotenv').config();
const fs = require('fs'), path = require('path');
const logsDir = path.join(__dirname, '..', 'logs');
fs.mkdirSync(logsDir, { recursive: true });
module.exports = {
  port: process.env.PORT || 3000,
  lowStockDefault: Number(process.env.LOW_STOCK_DEFAULT || 5),
  logsDir,
  log(msg, file = 'system.log') {
    fs.appendFileSync(path.join(logsDir, file), `${new Date().toISOString()} ${msg}\n`);
  }
};
