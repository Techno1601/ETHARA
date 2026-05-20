# Ethara Team Task Manager

A full-stack task management app with role-based access control for Admin and Member users.

## Features

- Authentication: Signup/Login
- Role-based access: Admin / Tasker / Reviewer
- Project creation and management
- Task creation, assignment, status tracking, and overdue detection
- Dashboard with task summaries and overdue counts
- REST API backend with SQLite
- React frontend with login and dashboard UI

## Tech Stack

- Backend: Node.js, Express, SQLite
- Frontend: React, Vite

## Run locally

1. Open terminal in the project root.
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
4. Start backend:
   ```bash
   cd ../backend
   npm run dev
   ```
5. Start frontend:
   ```bash
   cd ../frontend
   npm run dev
   ```

The frontend app will use the backend at `http://localhost:4000`.

## Default admin user

Signup with an Admin role or use the API to create users. The first admin can be added via signup.

## Notes

The backend stores data in `backend/database.sqlite`. Use `.env` to configure `JWT_SECRET` and `PORT`.
