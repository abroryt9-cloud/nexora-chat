import { apiClient } from './api';

export const botService = {
  async ping() {
    const { data } = await apiClient.get('/health');
    return data;
  },
};

export default botService;
