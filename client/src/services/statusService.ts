import { apiClient } from './api';

export const statusService = {
  async ping() {
    const { data } = await apiClient.get('/health');
    return data;
  },
};

export default statusService;
