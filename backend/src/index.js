const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.get('/api/dashboard', (req, res, next) => {
  const query = `
    SELECT
      SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) AS todo,
      SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) AS inProgress,
      SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) AS review,
      SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) AS accepted,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
      SUM(CASE WHEN status IN ('todo','in-progress','review') AND DATE(due_date) < DATE('now') THEN 1 ELSE 0 END) AS overdue
    FROM tasks`;

  db.get(query, [], (err, row) => {
    if (err) return next(err);
    res.json({ summary: row });
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
