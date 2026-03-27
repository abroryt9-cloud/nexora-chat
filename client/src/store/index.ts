import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice';
import chat from './chatSlice';
import wallet from './walletSlice';
import theme from './themeSlice';
import folder from './folderSlice';
import status from './statusSlice';
import channel from './channelSlice';
import bot from './botSlice';
import call from './callSlice';

export const store = configureStore({
  reducer: { auth, chat, wallet, theme, folder, status, channel, bot, call },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
