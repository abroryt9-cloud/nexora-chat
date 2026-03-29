import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import { RootState } from './store';
import { checkAuth } from './store/authSlice';

// Layout Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import BottomNav from './components/Layout/BottomNav';

// Auth Components
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';

// Main Components
import ChatList from './components/Chat/ChatList';
import ChatWindow from './components/Chat/ChatWindow';
import ProfilePanel from './components/Profile/ProfilePanel';
import Settings from './components/Settings/Settings';
import Wallet from './components/Profile/Wallet';

// Common Components
import Loader from './components/Common/Loader';
import CosmicBackground from './components/Common/CosmicBackground';

const App = (): JSX.Element => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  const { currentTheme } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    // Проверяем аутентификацию при загрузке
    dispatch(checkAuth() as any);
  }, [dispatch]);

  useEffect(() => {
    // Применяем тему
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  if (loading) {
    return (
      <div className="loading-screen">
        <CosmicBackground />
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <div className={`app-container ${currentTheme}-theme`}>
          <CosmicBackground />
          <div className="auth-container">
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
          <Toaster position="top-right" />
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className={`app-container ${currentTheme}-theme`}>
        <CosmicBackground />
        
        {/* Desktop Layout */}
        <div className="desktop-layout hidden md:grid">
          <Sidebar />
          <div className="main-content">
            <Header />
            <div className="content-area">
              <Routes>
                <Route path="/" element={<><ChatList /><ChatWindow /></>} />
                <Route path="/chat/:chatId" element={<><ChatList /><ChatWindow /></>} />
                <Route path="/profile" element={<ProfilePanel />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="mobile-layout md:hidden">
          <Header />
          <div className="mobile-content">
            <Routes>
              <Route path="/" element={<ChatList />} />
              <Route path="/chat/:chatId" element={<ChatWindow />} />
              <Route path="/profile" element={<ProfilePanel />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <BottomNav />
        </div>
        
        <Toaster position="top-right" />
      </div>
    </Router>
  );
};

export default App;
