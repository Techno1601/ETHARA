import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Account from './pages/Account';

const initialSession = {
  token: localStorage.getItem('ethara_token'),
  user: JSON.parse(localStorage.getItem('ethara_user') || 'null'),
};

function App() {
  const [session, setSession] = useState(initialSession);
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    localStorage.setItem('ethara_token', session.token || '');
    localStorage.setItem('ethara_user', JSON.stringify(session.user || null));
  }, [session]);

  const handleLogin = ({ token, user }) => {
    setSession({ token, user });
    setView('dashboard');
  };

  const handleLogout = () => {
    setSession({ token: null, user: null });
    setView('dashboard');
    localStorage.removeItem('ethara_token');
    localStorage.removeItem('ethara_user');
  };

  if (!session.token || !session.user) {
    return <Login onSuccess={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <header>
        <div>
          <h1>Ethara Task Manager</h1>
          <p>{session.user.name} ({session.user.role})</p>
        </div>
        <nav>
          <button onClick={() => setView('dashboard')}>Dashboard</button>
          <button onClick={() => setView('projects')}>Projects</button>
          <button onClick={() => setView('tasks')}>Tasks</button>
          <button onClick={() => setView('account')}>Account</button>
          <button className="secondary" onClick={handleLogout}>Logout</button>
        </nav>
      </header>

      <main>
        {view === 'dashboard' && <Dashboard />}
        {view === 'projects' && <Projects user={session.user} />}
        {view === 'tasks' && <Tasks user={session.user} />}
        {view === 'account' && <Account user={session.user} />}
      </main>
    </div>
  );
}

export default App;
