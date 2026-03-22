import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, User, Wallet, Award, Settings, Bot } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/chat', icon: MessageSquare, label: 'Chats' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/achievements', icon: Award, label: 'Achievements' },
    { to: '/ai', icon: Bot, label: 'AI Assistant' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-6">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-xl">N</span>
        </div>
      </div>
      <nav className="flex-1 flex flex-col gap-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `p-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'
              }`
            }
          >
            <item.icon size={24} />
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto">
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=3b82f6&color=fff`}
          alt="Avatar"
          className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600"
        />
      </div>
    </aside>
  );
};

export default Sidebar;
