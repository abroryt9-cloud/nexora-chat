import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchWallet, sendTokens, fetchTransactions } from '../store/walletSlice';

export const useWallet = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { wallet, price, transactions, loading } = useSelector((state: RootState) => state.wallet);

  const getWallet = useCallback(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  const send = useCallback((toAddress: string, amount: number) => {
    dispatch(sendTokens({ toAddress, amount }));
  }, [dispatch]);

  const getTransactions = useCallback(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  return {
    wallet,
    price,
    transactions,
    loading,
    fetchWallet: getWallet,
    sendTokens: send,
    fetchTransactions: getTransactions,
  };
};
