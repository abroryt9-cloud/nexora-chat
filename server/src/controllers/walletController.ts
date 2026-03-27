import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import { getNXRPrice, recordTransaction } from '../services/walletService';
import { generateWalletAddress } from '../services/walletService';

// Get wallet balance and current NXR price
export const getWallet = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('wallet');
    const price = await getNXRPrice();
    
    res.json({ 
      success: true,
      wallet: user?.wallet, 
      price 
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send tokens to another user
export const sendTokens = async (req: AuthRequest, res: Response) => {
  try {
    const { toAddress, amount } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    const recipient = await User.findOne({ 'wallet.address': toAddress });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Create transaction
    const transactionId = `tx_${Date.now()}`;
    
    // Update balances
    user.wallet.balance -= amount;
    recipient.wallet.balance += amount;
    
    const transaction = {
      id: transactionId,
      type: 'send' as const,
      amount,
      from: user.wallet.address,
      to: recipient.wallet.address,
      timestamp: new Date(),
      status: 'completed' as const,
    };
    
    user.wallet.transactions.push(transaction);
    recipient.wallet.transactions.push({ 
      ...transaction, 
      type: 'receive' as const 
    });
    
    await user.save();
    await recipient.save();
    
    // Record on blockchain (mock)
    await recordTransaction(user.wallet.address, recipient.wallet.address, amount);
    
    // Emit via WebSocket
    const io = req.app.get('io');
    io.to(`user:${recipient._id}`).emit('transactionReceived', {
      from: user.username,
      amount,
      transactionId,
    });

    res.json({ 
      success: true, 
      newBalance: user.wallet.balance,
      transactionId 
    });
  } catch (error) {
    console.error('Send tokens error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get transaction history
export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('wallet.transactions');
    
    res.json({ 
      success: true,
      transactions: user?.wallet.transactions || [] 
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current NXR price
export const getPrice = async (req: Request, res: Response) => {
  try {
    const price = await getNXRPrice();
    
    res.json({ 
      success: true,
      price,
      currency: 'USD' 
    });
  } catch (error) {
    console.error('Get price error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate new wallet address
export const generateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newAddress = generateWalletAddress();
    user.wallet.address = newAddress;
    await user.save();

    res.json({ 
      success: true, 
      address: newAddress 
    });
  } catch (error) {
    console.error('Generate address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Claim referral reward
export const claimReferral = async (req: AuthRequest, res: Response) => {
  try {
    const { referralCode } = req.body;
    
    const referrer = await User.findOne({ username: referralCode });
    if (!referrer) {
      return res.status(404).json({ message: 'Referral code not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already claimed
    if (user.wallet.transactions.some((t: any) => 
      t.type === 'reward' && t.from === 'referral'
    )) {
      return res.status(400).json({ message: 'Referral already claimed' });
    }

    const rewardAmount = 500; // NXR reward
    
    // Add reward to referrer
    referrer.wallet.balance += rewardAmount;
    referrer.wallet.transactions.unshift({
      id: `ref_${Date.now()}`,
      type: 'reward',
      amount: rewardAmount,
      from: 'referral',
      to: referrer.wallet.address,
      timestamp: new Date(),
      status: 'completed',
      hash: `ref_${user.username}`,
    });
    
    await referrer.save();

    res.json({
      success: true,
      message: `Claimed ${rewardAmount} NXR referral reward!`,
      amount: rewardAmount,
    });
  } catch (error) {
    console.error('Claim referral error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
