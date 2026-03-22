import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { languages } from '@nexora/shared';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm"
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
