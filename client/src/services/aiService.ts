import { apiClient } from './api';

export const aiService = {
  async ping() {
    const { data } = await apiClient.get('/health');
    return data;
  },
};

export default aiService;
