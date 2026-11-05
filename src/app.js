const express = require('express'), path = require('path'), cfg = require('../config/app_config');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', require('./routes'));
app.use('/api', (q, s) => s.status(404).json({ error: 'Not found' }));
app.use(require('./middleware/auth').errorHandler);
app.listen(cfg.port, () => console.log(`Pet shop system running at http://localhost:${cfg.port}`));
