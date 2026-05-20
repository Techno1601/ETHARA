const API_BASE = 'http://localhost:4000/api';

export const authHeaders = () => {
  const token = localStorage.getItem('ethara_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const signup = (payload) => fetch(`${API_BASE}/auth/signup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
}).then((res) => res.json());

export const login = (payload) => fetch(`${API_BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
}).then((res) => res.json());

export const fetchProjects = () => fetch(`${API_BASE}/projects`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } }).then((res) => res.json());
export const createProject = (payload) => fetch(`${API_BASE}/projects`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...authHeaders() },
  body: JSON.stringify(payload),
}).then((res) => res.json());

export const fetchTasks = () => fetch(`${API_BASE}/tasks`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } }).then((res) => res.json());
export const createTask = (payload) => fetch(`${API_BASE}/tasks`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...authHeaders() },
  body: JSON.stringify(payload),
}).then((res) => res.json());
export const updateTask = (id, payload) => fetch(`${API_BASE}/tasks/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', ...authHeaders() },
  body: JSON.stringify(payload),
}).then((res) => res.json());
export const fetchUsers = (role) => fetch(`${API_BASE}/users${role ? `?role=${role}` : ''}`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } }).then((res) => res.json());
export const fetchDashboard = () => fetch(`${API_BASE}/dashboard`, { headers: { 'Content-Type': 'application/json' } }).then((res) => res.json());
