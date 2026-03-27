import { apiClient } from './api';

export const folderService = {
  async ping() {
    const { data } = await apiClient.get('/health');
    return data;
  },
};

export default folderService;
