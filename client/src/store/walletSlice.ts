import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { walletService } from '../services/walletService';
import { IWallet, ITransaction } from '@nexora/shared';

interface WalletState {
  wallet: IWallet | null;
  price: number;
  transactions: ITransaction[];
  loading: boolean;
}

const initialState: WalletState = {
  wallet: null,
  price: 0,
  transactions: [],
  loading: false,
};

export const fetchWallet = createAsyncThunk('wallet/fetch', async () => {
  const response = await walletService.getWallet();
  return response.data;
});

export const sendTokens = createAsyncThunk(
  'wallet/send',
  async ({ toAddress, amount }: { toAddress: string; amount: number }) => {
    const response = await walletService.sendTokens(toAddress, amount);
    return response.data;
  }
);

export const fetchTransactions = createAsyncThunk('wallet/transactions', async () => {
  const response = await walletService.getTransactions();
  return response.data;
});

export const fetchPrice = createAsyncThunk('wallet/price', async () => {
  const response = await walletService.getPrice();
  return response.data.price;
});

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.wallet = action.payload.wallet;
        state.price = action.payload.price;
      })
      .addCase(sendTokens.fulfilled, (state, action) => {
        if (state.wallet) state.wallet.balance = action.payload.newBalance;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      .addCase(fetchPrice.fulfilled, (state, action) => {
        state.price = action.payload;
      });
  },
});

export default walletSlice.reducer;
