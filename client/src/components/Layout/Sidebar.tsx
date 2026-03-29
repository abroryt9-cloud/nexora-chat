import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MessageCircle, 
  User, 
  Wallet, 
  Settings, 
  LogOut, 
  Moon,
  Sun,
  Palette,
  Stars
} from 'lucide-react';

import { RootState } from '../../store';
import { logoutUser } from '../../store/authSlice';
import { toggleTheme, setTheme } from '../../store/themeSlice';
import GlassCard from '../Common/GlassCard';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentTheme } = useSelector((state: RootState) => state.theme);
  
  const handleLogout = () => {
    dispatch(logoutUser() as any);
  };
  
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };
  
  const navItems = [
    { to: '/', icon: MessageCircle, label: 'Чаты', badge: 3 },
    { to: '/profile', icon: User, label: 'Профиль' },
    { to: '/wallet', icon: Wallet, label: 'Кошелёк', badge: user?.walletBalance },
    { to: '/settings', icon: Settings, label: 'Настройки' },
  ];
  
  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'cosmic':
      case 'aurora':
      case 'nebula':
      case 'galaxy':
        return Stars;
      default: return Palette;
    }
  };
  
  const ThemeIcon = getThemeIcon();

  return (
    <aside className="sidebar">
      <GlassCard className="sidebar-container" padding="sm">
        {/* Логотип */}
        <div className="sidebar-header">
          <div className="logo">
            <Stars className="logo-icon" />
            <h2 className="logo-text">Nexora</h2>
          </div>
          <p className="logo-subtitle">Мессенджер будущего</p>
        </div>
        
        {/* Профиль пользователя */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.username || 'Пользователь'}</p>
            <p className="user-status online">В сети</p>
          </div>
        </div>
        
        {/* Навигация */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">
                    {typeof item.badge === 'number' && item.badge > 999 
                      ? '999+' 
                      : item.badge
                    }
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
        
        {/* Переключатель темы */}
        <div className="sidebar-theme">
          <button 
            onClick={handleThemeToggle}
            className="theme-toggle"
            title={`Текущая тема: ${currentTheme}`}
          >
            <ThemeIcon className="theme-icon" />
            <span className="theme-text">{currentTheme}</span>
          </button>
        </div>
        
        {/* Кнопка выхода */}
        <div className="sidebar-footer">
          <button 
            onClick={handleLogout}
            className="logout-button"
            title="Выйти"
          >
            <LogOut className="logout-icon" />
            <span className="logout-text">Выйти</span>
          </button>
        </div>
      </GlassCard>
    </aside>
  );
};

export default Sidebar;
