import api from './api';

export const walletService = {
  getWallet: () => api.get('/wallet'),
  sendTokens: (toAddress: string, amount: number) =>
    api.post('/wallet/send', { toAddress, amount }),
  getTransactions: () => api.get('/wallet/transactions'),
  getPrice: () => api.get('/wallet/price'),
};
