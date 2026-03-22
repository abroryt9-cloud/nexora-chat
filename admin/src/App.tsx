import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Chats from './pages/Chats';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import SystemLogs from './pages/SystemLogs';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <Login />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/logs" element={<SystemLogs />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
