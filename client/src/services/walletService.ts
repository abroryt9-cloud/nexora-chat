import { apiClient } from './api';

export const walletService = {
  async ping() {
    const { data } = await apiClient.get('/health');
    return data;
  },
};

export default walletService;
