import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setTheme as setThemeAction } from '../store/userSlice';

const THEMES = ['light', 'dark', 'cosmic', 'aurora'];

export const useTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.user.theme);
  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setLocalTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: string) => {
    if (THEMES.includes(newTheme)) {
      dispatch(setThemeAction(newTheme));
      localStorage.setItem('theme', newTheme);
    }
  };

  const toggleTheme = () => {
    const currentIndex = THEMES.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex]);
  };

  const getNextTheme = () => {
    const currentIndex = THEMES.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    return THEMES[nextIndex];
  };

  return { theme: localTheme, setTheme, toggleTheme, getNextTheme, availableThemes: THEMES };
};
