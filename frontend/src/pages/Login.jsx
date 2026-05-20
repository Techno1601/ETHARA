import { useState } from 'react';
import { login, signup } from '../api';

const initialForm = { name: '', email: '', password: '', role: 'tasker' };

export default function Login({ onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const action = isSignup ? signup : login;
    const payload = isSignup ? form : { email: form.email, password: form.password };
    const data = await action(payload);
    if (data.error) {
      setError(data.error);
      return;
    }
    if (data.token) onSuccess(data);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>{isSignup ? 'Signup' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
          )}
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </label>
          {isSignup && (
            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="tasker">Tasker</option>
                <option value="reviewer">Reviewer</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}
          <button type="submit">{isSignup ? 'Create Account' : 'Login'}</button>
          {error && <p className="error">{error}</p>}
        </form>
        <button className="link-button" onClick={() => setIsSignup((current) => !current)}>
          {isSignup ? 'Already have an account? Login' : "Don't have an account? Signup"}
        </button>
      </div>
    </div>
  );
}
