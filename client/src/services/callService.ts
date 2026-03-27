import { apiClient } from './api';

export const callService = {
  async ping() {
    const { data } = await apiClient.get('/health');
    return data;
  },
};

export default callService;
