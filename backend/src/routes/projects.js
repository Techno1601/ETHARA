const express = require('express');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const db = require('../db');

const router = express.Router();

router.use(requireAuth);

router.get('/', (req, res, next) => {
  db.all('SELECT * FROM projects ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

router.post('/', requireRole(['admin']), (req, res, next) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });
  db.run(
    'INSERT INTO projects (name, description) VALUES (?, ?)',
    [name, description || ''],
    function (err) {
      if (err) return next(err);
      db.get('SELECT * FROM projects WHERE id = ?', [this.lastID], (err2, project) => {
        if (err2) return next(err2);
        res.status(201).json(project);
      });
    }
  );
});

router.put('/:id', requireRole(['admin']), (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;
  db.run(
    'UPDATE projects SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, description, id],
    function (err) {
      if (err) return next(err);
      if (this.changes === 0) return res.status(404).json({ error: 'Project not found' });
      db.get('SELECT * FROM projects WHERE id = ?', [id], (err2, project) => {
        if (err2) return next(err2);
        res.json(project);
      });
    }
  );
});

router.delete('/:id', requireRole(['admin']), (req, res, next) => {
  const { id } = req.params;
  db.run('DELETE FROM projects WHERE id = ?', [id], function (err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ error: 'Project not found' });
    res.status(204).end();
  });
});

module.exports = router;
