import { apiClient } from './api';

export const stickerService = {
  async ping() {
    const { data } = await apiClient.get('/health');
    return data;
  },
};

export default stickerService;
