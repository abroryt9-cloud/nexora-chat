import { apiClient } from './api';

export const channelService = {
  async ping() {
    const { data } = await apiClient.get('/health');
    return data;
  },
};

export default channelService;
