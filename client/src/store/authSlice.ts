import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import { IUser } from '@nexora/shared';

interface AuthState {
  user: IUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await authService.login(credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: { username: string; email: string; password: string }) => {
    const response = await authService.register(data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  }
);

export const verifyTwoFactorCode = createAsyncThunk(
  'auth/verify2FA',
  async (data: { tempToken: string; code: string }) => {
    const response = await authService.verify2FA(data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  }
);

export const setupTwoFactor = createAsyncThunk('auth/setup2FA', async () => {
  const response = await authService.setup2FA();
  return response.data;
});

export const enableTwoFactor = createAsyncThunk(
  'auth/enable2FA',
  async (code: string) => {
    const response = await authService.enable2FA(code);
    return response.data;
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
});

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: any) => {
    const response = await authService.updateProfile(data);
    return response.data;
  }
);

export const uploadUserAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (file: File) => {
    const response = await authService.uploadAvatar(file);
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(uploadUserAvatar.fulfilled, (state, action) => {
        if (state.user) state.user.avatar = action.payload.avatar;
      });
  },
});

export default authSlice.reducer;
