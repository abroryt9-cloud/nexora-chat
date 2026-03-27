import { apiClient } from './api';

export const gifService = {
  async ping() {
    const { data } = await apiClient.get('/health');
    return data;
  },
};

export default gifService;
