import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  language: string;
  theme: string;
}

const initialState: UserState = {
  language: localStorage.getItem('language') || 'en',
  theme: localStorage.getItem('theme') || 'dark',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
  },
});

export const { setLanguage, setTheme } = userSlice.actions;
export default userSlice.reducer;
