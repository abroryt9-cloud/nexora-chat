import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import ChatWindow from './components/Chat/ChatWindow';
import ChatList from './components/Chat/ChatList';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import ProfilePanel from './components/Profile/ProfilePanel';
import { Loader } from './components/Common/Loader';

function App() {
  const { user, loading, checkAuth } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <ChatList />
          <Routes>
            <Route path="/chat/:chatId" element={<ChatWindow />} />
            <Route path="/profile" element={<ProfilePanel />} />
            <Route path="/" element={<Navigate to="/chat" />} />
          </Routes>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
