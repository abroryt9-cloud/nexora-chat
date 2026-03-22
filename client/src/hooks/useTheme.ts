import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setTheme as setThemeAction } from '../store/userSlice';

export const useTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.user.theme);
  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setLocalTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: string) => {
    dispatch(setThemeAction(newTheme));
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return { theme: localTheme, setTheme, toggleTheme };
};
