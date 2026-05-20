const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const createUsers = `
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','tasker','reviewer')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;

const createProjects = `
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;

const createTasks = `
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK(status IN ('todo','in-progress','review','accepted','rejected')) DEFAULT 'todo',
  due_date TEXT,
  project_id INTEGER,
  assigned_to INTEGER,
  reviewer_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(id),
  FOREIGN KEY(assigned_to) REFERENCES users(id),
  FOREIGN KEY(reviewer_id) REFERENCES users(id)
);`;

const initSchema = () => {
  db.run(createProjects, (err) => {
    if (err) {
      console.error('Failed to initialize projects table:', err.message);
      process.exit(1);
    }
  });

  db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
    if (err) {
      console.error('Failed to inspect users table:', err.message);
      process.exit(1);
    }

    if (!row) {
      db.run(createUsers, (createErr) => {
        if (createErr) {
          console.error('Failed to create users table:', createErr.message);
          process.exit(1);
        }
      });
    } else if (row.sql.includes("CHECK(role IN ('admin','member'))")) {
      db.serialize(() => {
        db.run('PRAGMA foreign_keys = OFF');
        db.run('ALTER TABLE users RENAME TO users_old');
        db.run(createUsers);
        db.run('INSERT INTO users (id, name, email, password, role, created_at) SELECT id, name, email, password, role, created_at FROM users_old');
        db.run('DROP TABLE users_old');
        db.run('PRAGMA foreign_keys = ON');
      });
    }
  });

  db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='tasks'", (err, row) => {
    if (err) {
      console.error('Failed to inspect tasks table:', err.message);
      process.exit(1);
    }

    if (!row) {
      db.run(createTasks, (createErr) => {
        if (createErr) {
          console.error('Failed to create tasks table:', createErr.message);
          process.exit(1);
        }
      });
    } else if (row.sql.includes("CHECK(status IN ('todo','in-progress','done'))") || !row.sql.includes('reviewer_id')) {
      db.serialize(() => {
        db.run('PRAGMA foreign_keys = OFF');
        db.run('ALTER TABLE tasks RENAME TO tasks_old');
        db.run(createTasks, (createErr) => {
          if (createErr) {
            console.error('Failed to create new tasks table:', createErr.message);
            process.exit(1);
          }
        });
        db.run(
          'INSERT INTO tasks (id, title, description, status, due_date, project_id, assigned_to, created_at, updated_at) SELECT id, title, description, status, due_date, project_id, assigned_to, created_at, updated_at FROM tasks_old'
        );
        db.run('DROP TABLE tasks_old');
        db.run('PRAGMA foreign_keys = ON');
      });
    }
  });
};

initSchema();

module.exports = db;
