import React from 'react';
import { Users } from 'lucide-react';
import GlassCard from '../Common/GlassCard';

const Contacts: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF] bg-clip-text text-transparent">
        Contacts
      </h1>
      
      <div className="flex-1 flex items-center justify-center">
        <GlassCard className="text-center p-8">
          <Users className="w-16 h-16 text-[#8E9AAF] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Contacts List</h3>
          <p className="text-[#8E9AAF]">Your contacts will appear here</p>
        </GlassCard>
      </div>
    </div>
  );
};

export default Contacts;
