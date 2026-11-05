// Shared list/create/update/delete handlers; `hook` can transform the body first
module.exports = (m, hook = d => d) => ({
  list: (q, s) => s.json(m.all()),
  create: (q, s) => s.status(201).json(m.get(m.create(hook(q.body)))),
  update: (q, s) => { m.update(q.params.id, hook(q.body)); s.json(m.get(q.params.id)); },
  remove: (q, s) => { m.remove(q.params.id); s.json({ ok: true }); }
});
