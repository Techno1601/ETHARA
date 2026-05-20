import { useEffect, useState } from 'react';
import { createTask, fetchProjects, fetchTasks, fetchUsers, updateTask } from '../api';

const initialForm = { title: '', description: '', status: 'todo', due_date: '', project_id: '', assigned_to: '', reviewer_id: '' };

export default function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [taskers, setTaskers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [reviewerSelection, setReviewerSelection] = useState({});

  const loadTasks = () => {
    fetchTasks().then((data) => {
      if (data.error) setError(data.error);
      else setTasks(data);
    });
  };

  const loadProjects = () => {
    fetchProjects().then((data) => {
      if (!data.error) setProjects(data);
    });
  };

  useEffect(() => {
    loadTasks();
    loadProjects();
    loadUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const payload = {
      ...form,
      project_id: Number(form.project_id),
      assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      reviewer_id: form.reviewer_id ? Number(form.reviewer_id) : null,
    };
    const created = await createTask(payload);
    if (created.error) {
      setError(created.error);
      return;
    }
    setForm(initialForm);
    loadTasks();
  };

  const handleStatusUpdate = async (task, status) => {
    const payload = {
      title: task.title,
      description: task.description,
      status,
      due_date: task.due_date,
      project_id: task.project_id,
      assigned_to: task.assigned_to,
      reviewer_id: task.reviewer_id,
    };
    const updated = await updateTask(task.id, payload);
    if (!updated.error) {
      loadTasks();
    } else {
      setError(updated.error);
    }
  };

  const handleSendReview = async (task) => {
    setError(null);
    const reviewerId = reviewerSelection[task.id] || task.reviewer_id;
    if (!reviewerId) {
      setError('Select a reviewer before sending the task for review.');
      return;
    }
    const updated = await updateTask(task.id, {
      title: task.title,
      description: task.description,
      status: 'review',
      due_date: task.due_date,
      project_id: task.project_id,
      assigned_to: task.assigned_to,
      reviewer_id: Number(reviewerId),
    });
    if (!updated.error) {
      loadTasks();
    } else {
      setError(updated.error);
    }
  };

  const handleReviewerSelect = (taskId, value) => {
    setReviewerSelection((prev) => ({ ...prev, [taskId]: value }));
  };

  const loadUsers = () => {
    fetchUsers('reviewer').then((data) => {
      if (!data.error) setReviewers(data);
    });
    fetchUsers('tasker').then((data) => {
      if (!data.error) setTaskers(data);
    });
  };

  return (
    <div className="page-content">
      <h2>Tasks</h2>
      <section className="panel">
        <h3>Create Task</h3>
        {user.role === 'admin' ? (
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Title
              <input name="title" value={form.title} onChange={handleChange} required />
            </label>
            <label>
              Description
              <textarea name="description" value={form.description} onChange={handleChange} />
            </label>
            <label>
              Project
              <select name="project_id" value={form.project_id} onChange={handleChange} required>
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
              </select>
            </label>
            <label>
              Assign Tasker
              <select name="assigned_to" value={form.assigned_to} onChange={handleChange}>
                <option value="">Select tasker</option>
                {taskers.map((tasker) => (
                  <option key={tasker.id} value={tasker.id}>{tasker.name}</option>
                ))}
              </select>
            </label>
            <label>
              Assign Reviewer
              <select name="reviewer_id" value={form.reviewer_id} onChange={handleChange}>
                <option value="">Select reviewer</option>
                {reviewers.map((reviewer) => (
                  <option key={reviewer.id} value={reviewer.id}>{reviewer.name}</option>
                ))}
              </select>
            </label>
            <label>
              Due Date
              <input name="due_date" type="date" value={form.due_date} onChange={handleChange} />
            </label>
            <button type="submit">Create Task</button>
          </form>
        ) : (
          <p className="info-message">Only Admin users can create tasks. Taskers can perform and update task status, and Reviewers can view task details.</p>
        )}
        {error && <p className="error">{error}</p>}
      </section>

      <section className="panel">
        <h3>Task List</h3>
        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <table className="task-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Status</th>
                <th>Tasker</th>
                <th>Reviewer</th>
                <th>Due</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.project_name || 'Unknown'}</td>
                  <td>{task.status}</td>
                  <td>{task.tasker_name || 'Unassigned'}</td>
                  <td>{task.reviewer_name || 'Unassigned'}</td>
                  <td>{task.due_date || '—'}</td>
                  <td>
                    {user.role === 'tasker' && task.status !== 'accepted' && task.status !== 'rejected' && (
                      <div className="task-actions">
                        <select
                          value={reviewerSelection[task.id] || task.reviewer_id || ''}
                          onChange={(e) => handleReviewerSelect(task.id, e.target.value)}
                        >
                          <option value="">Select reviewer</option>
                          {reviewers.map((reviewer) => (
                            <option key={reviewer.id} value={reviewer.id}>{reviewer.name}</option>
                          ))}
                        </select>
                        <button type="button" onClick={() => handleSendReview(task)}>
                          Send to Review
                        </button>
                        {task.status !== 'review' && (
                          <button type="button" onClick={() => handleStatusUpdate(task, 'in-progress')}>
                            Mark In Progress
                          </button>
                        )}
                      </div>
                    )}
                    {user.role === 'reviewer' && task.status === 'review' && (
                      <div className="task-actions">
                        <button type="button" onClick={() => handleStatusUpdate(task, 'accepted')}>
                          Accept
                        </button>
                        <button type="button" onClick={() => handleStatusUpdate(task, 'rejected')}>
                          Reject
                        </button>
                      </div>
                    )}
                    {user.role === 'reviewer' && task.status !== 'review' && <span>Waiting</span>}
                    {user.role === 'admin' && <span>Admin view</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
