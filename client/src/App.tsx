import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import SplashScreen from './components/Auth/SplashScreen';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import ChatWindow from './components/Chat/ChatWindow';
import ChatList from './components/Chat/ChatList';
import Sidebar from './components/Layout/Sidebar';
import ProfilePanel from './components/Profile/ProfilePanel';
import Wallet from './components/Profile/Wallet';
import { useWebSocket } from './hooks/useWebSocket';
import './styles/globals.css';
import './styles/animations.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { user, token } = useSelector((state: RootState) => state.auth);

  // Connect WebSocket
  useWebSocket();

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Hide splash after animation
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => setShowSplash(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Show splash on first load
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0C12] text-[#F0F3FA] overflow-hidden">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<Navigate to="/chats" replace />} />
            <Route path="/chats" element={<ChatList />} />
            <Route path="/chat/:chatId" element={<ChatWindow />} />
            <Route path="/profile" element={<ProfilePanel />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="*" element={<Navigate to="/chats" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
