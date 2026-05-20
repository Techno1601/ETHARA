const express = require('express');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const db = require('../db');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res, next) => {
  let query = `
    SELECT tasks.*, projects.name AS project_name,
      tasker.name AS tasker_name,
      reviewer.name AS reviewer_name
    FROM tasks
    LEFT JOIN projects ON tasks.project_id = projects.id
    LEFT JOIN users AS tasker ON tasks.assigned_to = tasker.id
    LEFT JOIN users AS reviewer ON tasks.reviewer_id = reviewer.id`;
  const params = [];

  if (req.user.role === 'tasker') {
    query += ' WHERE tasks.assigned_to = ?';
    params.push(req.user.id);
  } else if (req.user.role === 'reviewer') {
    query += ' WHERE tasks.reviewer_id = ?';
    params.push(req.user.id);
  }

  query += ' ORDER BY tasks.created_at DESC';
  db.all(query, params, (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

router.post('/', requireRole(['admin']), (req, res, next) => {
  const { title, description, status, due_date, project_id, assigned_to, reviewer_id } = req.body;
  if (!title || !project_id) {
    return res.status(400).json({ error: 'Title and project are required' });
  }
  const validStatus = ['todo', 'in-progress', 'review', 'accepted', 'rejected'];
  const normalizedStatus = validStatus.includes(status) ? status : 'todo';

  db.run(
    'INSERT INTO tasks (title, description, status, due_date, project_id, assigned_to, reviewer_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, description || '', normalizedStatus, due_date || null, project_id, assigned_to || null, reviewer_id || null],
    function (err) {
      if (err) return next(err);
      db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err2, task) => {
        if (err2) return next(err2);
        res.status(201).json(task);
      });
    }
  );
});

router.put('/:id', requireRole(['admin', 'tasker', 'reviewer']), (req, res, next) => {
  const { id } = req.params;
  const { title, description, status, due_date, project_id, assigned_to, reviewer_id } = req.body;

  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, task) => {
    if (err) return next(err);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role === 'tasker' && task.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Taskers can only update their own tasks' });
    }
    if (req.user.role === 'reviewer' && task.reviewer_id !== req.user.id) {
      return res.status(403).json({ error: 'Reviewers can only verify assigned tasks' });
    }

    const validStatus = ['todo', 'in-progress', 'review', 'accepted', 'rejected'];
    let normalizedStatus = task.status;
    if (status && validStatus.includes(status)) {
      normalizedStatus = status;
    }

    if (req.user.role === 'tasker') {
      const validTaskerStatuses = ['todo', 'in-progress', 'review'];
      if (!validTaskerStatuses.includes(normalizedStatus)) {
        return res.status(403).json({ error: 'Taskers can only move tasks to in-progress or review' });
      }
      if (normalizedStatus === 'review' && !reviewer_id && !task.reviewer_id) {
        return res.status(400).json({ error: 'Reviewer must be assigned before sending task for review' });
      }
    }

    if (req.user.role === 'reviewer') {
      const validReviewerStatuses = ['accepted', 'rejected'];
      if (!validReviewerStatuses.includes(normalizedStatus)) {
        return res.status(403).json({ error: 'Reviewers can only accept or reject tasks' });
      }
    }

    const updatedReviewerId = reviewer_id || task.reviewer_id;
    const updatedAssignedTo = assigned_to || task.assigned_to;

    db.run(
      'UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ?, project_id = ?, assigned_to = ?, reviewer_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title || task.title, description || task.description, normalizedStatus, due_date || task.due_date, project_id || task.project_id, updatedAssignedTo, updatedReviewerId, id],
      function (updateErr) {
        if (updateErr) return next(updateErr);
        db.get('SELECT * FROM tasks WHERE id = ?', [id], (err2, updatedTask) => {
          if (err2) return next(err2);
          res.json(updatedTask);
        });
      }
    );
  });
});

router.delete('/:id', requireRole(['admin']), (req, res, next) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ error: 'Task not found' });
    res.status(204).end();
  });
});

module.exports = router;
