import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import { getNXRPrice, recordTransaction } from '../services/walletService';

export const getWallet = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('wallet');
    const price = await getNXRPrice();
    res.json({ wallet: user?.wallet, price });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendTokens = async (req: AuthRequest, res: Response) => {
  try {
    const { toAddress, amount } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.wallet.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });
    const recipient = await User.findOne({ 'wallet.address': toAddress });
    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });
    // Update balances
    user.wallet.balance -= amount;
    recipient.wallet.balance += amount;
    const transaction = {
      id: `tx_${Date.now()}`,
      type: 'send' as const,
      amount,
      from: user.wallet.address,
      to: recipient.wallet.address,
      timestamp: new Date(),
      status: 'completed' as const,
    };
    user.wallet.transactions.push(transaction);
    recipient.wallet.transactions.push({ ...transaction, type: 'receive' });
    await user.save();
    await recipient.save();
    // Record on blockchain (mock)
    await recordTransaction(user.wallet.address, recipient.wallet.address, amount);
    res.json({ success: true, newBalance: user.wallet.balance });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('wallet.transactions');
    res.json(user?.wallet.transactions || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNXRPrice = async (req: Request, res: Response) => {
  try {
    const price = await getNXRPrice();
    res.json({ price });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
