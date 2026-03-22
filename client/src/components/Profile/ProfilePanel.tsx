import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import AvatarUploader from './AvatarUploader';
import Wallet from './Wallet';
import NFTCard from './NFTCard';
import TwoFactorAuth from '../Auth/TwoFactorAuth';

const ProfilePanel: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { language, setLanguage, languages } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState(user?.username || '');

  const handleUpdate = async () => {
    await updateProfile({ username });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
          <div className="flex items-center gap-6 mb-6">
            <AvatarUploader />
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <button onClick={handleUpdate} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg">
                Save
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.nativeName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="cosmic">Cosmic</option>
                <option value="aurora">Aurora</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Crypto Wallet</h2>
          <Wallet />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">My NFTs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <NFTCard nft={null} /> {/* placeholder */}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Security</h2>
          <TwoFactorAuth />
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
