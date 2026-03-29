import React from 'react';
import { useSelector } from 'react-redux';
import { Search, Bell, Menu } from 'lucide-react';

import { RootState } from '../../store';
import GlassCard from '../Common/GlassCard';

const Header: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  return (
    <header className="app-header">
      <GlassCard className="header-container" padding="sm">
        {/* Mobile menu button */}
        <button className="mobile-menu-btn md:hidden">
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Search */}
        <div className="header-search">
          <div className="search-container">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Поиск чатов, пользователей, сообщений..."
              className="search-input"
            />
          </div>
        </div>
        
        {/* User info */}
        <div className="header-user">
          {/* Notifications */}
          <button className="notification-btn">
            <Bell className="w-5 h-5" />
            <span className="notification-badge">3</span>
          </button>
          
          {/* User avatar */}
          <div className="header-avatar">
            <span className="avatar-text">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      </GlassCard>
    </header>
  );
};

export default Header;
