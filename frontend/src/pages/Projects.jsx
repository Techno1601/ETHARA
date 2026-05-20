import { useEffect, useState } from 'react';
import { createProject, fetchProjects } from '../api';

export default function Projects({ user }) {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState(null);

  const loadProjects = () => {
    fetchProjects().then((data) => {
      if (data.error) setError(data.error);
      else setProjects(data);
    });
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const created = await createProject(form);
    if (created.error) {
      setError(created.error);
      return;
    }
    setForm({ name: '', description: '' });
    loadProjects();
  };

  return (
    <div className="page-content">
      <h2>Projects</h2>
      {user.role === 'admin' && (
        <section className="panel">
          <h3>Create New Project</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Description
              <textarea name="description" value={form.description} onChange={handleChange} />
            </label>
            <button type="submit">Create Project</button>
          </form>
          {error && <p className="error">{error}</p>}
        </section>
      )}

      <section className="panel">
        <h3>Project List</h3>
        {projects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          <ul className="list-card">
            {projects.map((project) => (
              <li key={project.id}>
                <strong>{project.name}</strong>
                <p>{project.description || 'No description'}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
