const express = require('express');
const requireAuth = require('../middleware/auth');
const db = require('../db');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res, next) => {
  const { role } = req.query;
  let query = 'SELECT id, name, email, role FROM users';
  const params = [];
  if (role) {
    query += ' WHERE role = ?';
    params.push(role);
  }

  db.all(query, params, (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

module.exports = router;
