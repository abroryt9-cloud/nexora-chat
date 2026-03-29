import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  MessageCircle, 
  User, 
  Wallet, 
  Settings, 
  Phone,
  Users,
  Search,
  Bell
} from 'lucide-react';

import { RootState } from '../../store';
import GlassCard from '../Common/GlassCard';

const BottomNav: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { chats } = useSelector((state: RootState) => state.chat);
  
  // Подсчет непрочитанных сообщений
  const unreadCount = chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
  
  const navItems = [
    { 
      to: '/', 
      icon: MessageCircle, 
      label: 'Чаты',
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    { 
      to: '/calls', 
      icon: Phone, 
      label: 'Звонки'
    },
    { 
      to: '/contacts', 
      icon: Users, 
      label: 'Контакты'
    },
    { 
      to: '/profile', 
      icon: User, 
      label: 'Профиль'
    },
    { 
      to: '/settings', 
      icon: Settings, 
      label: 'Ещё'
    },
  ];

  return (
    <div className="bottom-nav-container">
      <GlassCard className="bottom-nav" padding="sm">
        <nav className="bottom-nav-items">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 
                  `bottom-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <div className="nav-item-icon-container">
                  <Icon className="nav-item-icon" />
                  {item.badge && (
                    <span className="nav-item-badge">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="nav-item-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        
        {/* Индикатор активной вкладки */}
        <div className="bottom-nav-indicator" />
      </GlassCard>
    </div>
  );
};

export default BottomNav;
