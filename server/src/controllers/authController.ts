import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User';
import { generateWalletAddress } from '../services/walletService';
import { redisClient } from '../config/redis';

// Generate JWT token
const generateToken = (id: string, expiresIn = '30d') => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn });
};

// Demo mode login - any phone/code works
export const demoLogin = async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({ message: 'Phone and code required' });
    }

    // Create or get user by phone
    let user = await User.findOne({ email: `${phone}@nexora.com` });
    
    if (!user) {
      // Create new demo user
      const walletAddress = generateWalletAddress();
      user = await User.create({
        username: `User_${phone.slice(-4)}`,
        email: `${phone}@nexora.com`,
        password: bcrypt.hashSync(code, 10),
        wallet: { 
          address: walletAddress, 
          balance: 1000,
          transactions: [] 
        },
        statistics: {
          totalMessages: 0,
          totalChats: 0,
          reactionsGiven: 0,
          stickersSent: 0,
          voiceMessagesSent: 0,
          pollsCreated: 0,
        },
        achievements: [],
      });
    }

    const token = generateToken(user._id.toString());
    
    await redisClient.set(`user:${user._id}:online`, 'true', { EX: 300 });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        wallet: user.wallet,
      },
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const walletAddress = generateWalletAddress();
    
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      wallet: { 
        address: walletAddress, 
        balance: 1000,
        transactions: [] 
      },
      statistics: {
        totalMessages: 0,
        totalChats: 0,
        reactionsGiven: 0,
        stickersSent: 0,
        voiceMessagesSent: 0,
        pollsCreated: 0,
      },
      achievements: [],
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        wallet: user.wallet,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.twoFactorEnabled) {
      const tempToken = generateToken(user._id.toString(), '5m');
      return res.status(200).json({ 
        twoFactorRequired: true, 
        tempToken,
        message: '2FA code required'
      });
    }

    const token = generateToken(user._id.toString());
    
    await redisClient.set(`user:${user._id}:online`, 'true', { EX: 300 });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        wallet: user.wallet,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyTwoFactor = async (req: Request, res: Response) => {
  try {
    const { tempToken, code } = req.body;
    
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET as string) as any;
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid 2FA code' });
    }

    const token = generateToken(user._id.toString());
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const setupTwoFactor = async (req: Request & { user?: any }, res: Response) => {
  try {
    const secret = speakeasy.generateSecret({ length: 20 });
    
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.twoFactorSecret = secret.base32;
    await user.save();

    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: `Nexora:${user.email}`,
      issuer: 'Nexora',
    });

    const qrCode = await QRCode.toDataURL(otpauthUrl);

    res.json({
      success: true,
      secret: secret.base32,
      qrCode,
    });
  } catch (error) {
    console.error('Setup 2FA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const enableTwoFactor = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { code } = req.body;
    
    const user = await User.findById(req.user?._id);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA not set up' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid code' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = await User.findById(req.user?._id)
      .select('-password -twoFactorSecret');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { username, avatar, bio, status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { username, avatar, bio, status },
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret');

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
