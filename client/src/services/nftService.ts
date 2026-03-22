import api from './api';

export const nftService = {
  getAll: () => api.get('/nft'),
  getUserNFTs: () => api.get('/nft/my'),
  buy: (nftId: string) => api.post(`/nft/buy/${nftId}`),
  mint: (data: any) => api.post('/nft/mint', data),
};
