const jwt = require('jsonwebtoken');
const db = require('../db');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'ethara_jwt_secret');
    db.get('SELECT id, name, email, role FROM users WHERE id = ?', [payload.userId], (err, user) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: 'Invalid token' });
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = requireAuth;
