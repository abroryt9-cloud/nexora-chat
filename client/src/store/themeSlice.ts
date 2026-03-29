import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeName = 'dark' | 'light' | 'cosmic' | 'aurora' | 'nebula' | 'galaxy';

interface ThemeState {
  currentTheme: ThemeName;
  availableThemes: ThemeName[];
  themes: ThemeName[];
}

const getInitialTheme = (): ThemeName => {
  const saved = localStorage.getItem('nexora_theme') as ThemeName;
  if (saved && ['dark', 'light', 'cosmic', 'aurora', 'nebula', 'galaxy'].includes(saved)) {
    return saved;
  }
  
  // Определяем тему по времени суток или системным настройкам
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 18) {
    return 'light';
  } else {
    return 'cosmic';
  }
};

const initialState: ThemeState = {
  currentTheme: getInitialTheme(),
  availableThemes: ['dark', 'light', 'cosmic', 'aurora', 'nebula', 'galaxy'],
  themes: ['dark', 'light', 'cosmic', 'aurora', 'nebula', 'galaxy'],
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeName>) => {
      state.currentTheme = action.payload;
      localStorage.setItem('nexora_theme', action.payload);
    },
    
    toggleTheme: (state) => {
      const currentIndex = state.availableThemes.indexOf(state.currentTheme);
      const nextIndex = (currentIndex + 1) % state.availableThemes.length;
      state.currentTheme = state.availableThemes[nextIndex];
      localStorage.setItem('nexora_theme', state.currentTheme);
    },
    
    setRandomTheme: (state) => {
      const randomIndex = Math.floor(Math.random() * state.availableThemes.length);
      state.currentTheme = state.availableThemes[randomIndex];
      localStorage.setItem('nexora_theme', state.currentTheme);
    },
    
    setAutoTheme: (state) => {
      const hour = new Date().getHours();
      const newTheme: ThemeName = hour >= 6 && hour < 18 ? 'light' : 'cosmic';
      state.currentTheme = newTheme;
      localStorage.setItem('nexora_theme', newTheme);
    },
  },
});

export const { setTheme, toggleTheme, setRandomTheme, setAutoTheme } = themeSlice.actions;
export default themeSlice.reducer;
