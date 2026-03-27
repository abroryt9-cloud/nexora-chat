import { apiClient } from './api';

export const authService = {
  async ping() {
    const { data } = await apiClient.get('/health');
    return data;
  },
};

export default authService;
