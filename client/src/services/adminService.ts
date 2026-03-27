import { apiClient } from './api';

export const adminService = {
  async ping() {
    const { data } = await apiClient.get('/health');
    return data;
  },
};

export default adminService;
