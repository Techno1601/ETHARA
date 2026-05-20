import { useEffect, useState } from 'react';
import { fetchDashboard } from '../api';

export default function Dashboard() {
  const [summary, setSummary] = useState({ todo: 0, inProgress: 0, review: 0, accepted: 0, rejected: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then((data) => {
        setSummary(data.summary || {});
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="page-content">
      <h2>Dashboard</h2>
      <div className="dashboard-grid">
        <div className="card status-card">
          <h3>Todo</h3>
          <p>{summary.todo}</p>
        </div>
        <div className="card status-card">
          <h3>In Progress</h3>
          <p>{summary.inProgress}</p>
        </div>
        <div className="card status-card">
          <h3>Review</h3>
          <p>{summary.review}</p>
        </div>
        <div className="card status-card">
          <h3>Accepted</h3>
          <p>{summary.accepted}</p>
        </div>
        <div className="card status-card">
          <h3>Rejected</h3>
          <p>{summary.rejected}</p>
        </div>
        <div className="card alert-card">
          <h3>Overdue</h3>
          <p>{summary.overdue}</p>
        </div>
      </div>
      <p>Use Projects and Tasks to manage team work and track progress.</p>
    </div>
  );
}
