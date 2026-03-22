import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, MessageSquare, User, Wallet, Award, Settings, Bot } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/chat', icon: MessageSquare, label: 'Chats' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/achievements', icon: Award, label: 'Achievements' },
    { to: '/ai', icon: Bot, label: 'AI Assistant' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden">
      <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="p-2">
            <X size={24} />
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
