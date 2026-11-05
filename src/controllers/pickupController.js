const { Pickup } = require('../models'), { bad } = require('../middleware/auth'), app = require('../../config/app_config');
exports.release = (q, s) => { // pet may only be released to an authorized person who showed valid ID
  const p = Pickup.get(q.params.id);
  if (!p) throw bad('Pickup record not found', 404);
  if (p.released_at) throw bad('This pet was already released');
  if (!p.id_presented) throw bad('Valid ID must be presented before release');
  Pickup.update(p.pickup_id, { released_at: new Date().toLocaleString('sv'), verified_by: q.user.id });
  app.log(`Pet ${p.pet_id} released to ${p.person_name}, verified by ${q.user.name}`);
  s.json(Pickup.get(p.pickup_id));
};
