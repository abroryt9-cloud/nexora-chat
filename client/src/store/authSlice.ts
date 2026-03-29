import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../services/api';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  bio?: string;
  role: 'user' | 'moderator' | 'admin' | 'superadmin';
  walletBalance: number;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('nexora_token'),
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Асинхронные действия
export const demoLogin = createAsyncThunk(
  'auth/demoLogin',
  async (credentials: { phone: string; code: string }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/auth/demo-login', credentials);
      localStorage.setItem('nexora_token', data.token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { user: data.user, token: data.token };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка демо входа';
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { loginId: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/auth/login', credentials);
      localStorage.setItem('nexora_token', data.token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { user: data.user, token: data.token };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка входа';
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; username: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/auth/register', userData);
      localStorage.setItem('nexora_token', data.token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { user: data.user, token: data.token };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ошибка регистрации';
      return rejectWithValue(message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('nexora_token');
      if (!token) {
        return rejectWithValue('Нет токена');
      }
      
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const { data } = await apiClient.get('/auth/me');
      return { user: data.user, token };
    } catch (error: any) {
      localStorage.removeItem('nexora_token');
      delete apiClient.defaults.headers.common['Authorization'];
      return rejectWithValue('Токен недействителен');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('nexora_token');
    delete apiClient.defaults.headers.common['Authorization'];
    return {};
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Demo Login
    builder
      .addCase(demoLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(demoLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(demoLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
