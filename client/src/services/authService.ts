import api from './api';

export const authService = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  verify2FA: (data: { tempToken: string; code: string }) =>
    api.post('/auth/verify-2fa', data),
  logout: () => api.post('/auth/logout'),
  setup2FA: () => api.post('/auth/2fa/setup'),
  enable2FA: (code: string) => api.post('/auth/2fa/enable', { code }),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
