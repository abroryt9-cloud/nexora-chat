import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageCircle, Users, User, Settings } from 'lucide-react';

const BottomNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[rgba(17,21,31,0.9)] backdrop-blur-xl border-t border-white/10 z-50">
      <div className="flex items-center justify-around py-2">
        <NavLink
          to="/chats"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 transition ${
              isActive ? 'text-[#6C5CE7]' : 'text-[#8E9AAF]'
            }`
          }
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs mt-1">Chats</span>
        </NavLink>

        <NavLink
          to="/contacts"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 transition ${
              isActive ? 'text-[#6C5CE7]' : 'text-[#8E9AAF]'
            }`
          }
        >
          <Users className="w-6 h-6" />
          <span className="text-xs mt-1">Contacts</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 transition ${
              isActive ? 'text-[#6C5CE7]' : 'text-[#8E9AAF]'
            }`
          }
        >
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">Profile</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 transition ${
              isActive ? 'text-[#6C5CE7]' : 'text-[#8E9AAF]'
            }`
          }
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs mt-1">Settings</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
