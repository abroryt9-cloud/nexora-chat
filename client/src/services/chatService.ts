import { apiClient } from './api';

export const chatService = {
  async ping() {
    const { data } = await apiClient.get('/health');
    return data;
  },
};

export default chatService;
