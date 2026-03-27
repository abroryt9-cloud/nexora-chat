import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setTheme } from '../../store/userSlice';
import { Moon, Sun, Sparkles, Languages, Bell, Shield, LogOut } from 'lucide-react';
import GlassCard from '../Common/GlassCard';

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useSelector((state: RootState) => state.user);
  const [language, setLanguage] = useState('en');

  const themes = [
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'cosmic', name: 'Cosmic', icon: Sparkles },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'es', name: 'Español' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'ar', name: 'العربية' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
  ];

  return (
    <div className="h-full overflow-y-auto p-4">
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF] bg-clip-text text-transparent">
        Settings
      </h1>

      <div className="space-y-6">
        {/* Theme Selection */}
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Theme
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => dispatch(setTheme(t.id))}
                className={`p-4 rounded-xl flex items-center gap-3 transition ${
                  theme === t.id
                    ? 'bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF]'
                    : 'bg-[rgba(26,29,45,0.6)] hover:bg-white/10'
                }`}
              >
                <t.icon className="w-5 h-5" />
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Language Selection */}
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Languages className="w-5 h-5" /> Language
          </h3>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-3 bg-[rgba(26,29,45,0.6)] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#6C5CE7]"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </GlassCard>

        {/* Notifications */}
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span>Push Notifications</span>
              <input type="checkbox" defaultChecked className="toggle" />
            </label>
            <label className="flex items-center justify-between">
              <span>Sound</span>
              <input type="checkbox" defaultChecked className="toggle" />
            </label>
          </div>
        </GlassCard>

        {/* Privacy */}
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Privacy
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-[rgba(26,29,45,0.6)] rounded-xl hover:bg-white/10 transition">
              Two-Factor Authentication
            </button>
            <button className="w-full text-left p-3 bg-[rgba(26,29,45,0.6)] rounded-xl hover:bg-white/10 transition">
              Privacy Policy
            </button>
          </div>
        </GlassCard>

        {/* Logout */}
        <button className="w-full p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 hover:bg-red-500/30 transition flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;
