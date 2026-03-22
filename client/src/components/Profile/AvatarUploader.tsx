import React, { useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Camera } from 'lucide-react';

const AvatarUploader: React.FC = () => {
  const { user, uploadAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  return (
    <div className="relative">
      <img
        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=3b82f6&color=fff`}
        alt="Avatar"
        className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full"
      >
        <Camera size={16} />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
};

export default AvatarUploader;
