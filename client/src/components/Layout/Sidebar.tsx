import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageCircle, Users, User } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col w-20 border-r border-white/10 bg-[rgba(17,21,31,0.6)] backdrop-blur-xl">
      {/* Logo */}
      <div className="p-4 flex justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00D9FF] flex items-center justify-center">
          <span className="text-2xl font-bold text-white">N</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 p-2">
        <NavLink
          to="/chats"
          className={({ isActive }) =>
            `p-3 rounded-xl flex items-center justify-center transition ${
              isActive
                ? 'bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF]'
                : 'hover:bg-white/10'
            }`
          }
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </NavLink>

        <NavLink
          to="/contacts"
          className={({ isActive }) =>
            `p-3 rounded-xl flex items-center justify-center transition ${
              isActive
                ? 'bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF]'
                : 'hover:bg-white/10'
            }`
          }
        >
          <Users className="w-6 h-6 text-white" />
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `p-3 rounded-xl flex items-center justify-center transition ${
              isActive
                ? 'bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF]'
                : 'hover:bg-white/10'
            }`
          }
        >
          <User className="w-6 h-6 text-white" />
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
