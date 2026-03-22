import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User';
import { generateWalletAddress } from '../services/walletService';
import { sendVerificationEmail } from '../services/emailService';
import { redisClient } from '../config/redis';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
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
      wallet: { address: walletAddress, balance: 100, transactions: [] }, // начальный бонус 100 NXR
      statistics: { totalMessages: 0, totalChats: 0, reactionsGiven: 0, stickersSent: 0, voiceMessagesSent: 0, pollsCreated: 0 },
    });
    const token = generateToken(user._id);
    // Отправка приветственного письма
    await sendVerificationEmail(email, token);
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar, role: user.role } });
  } catch (error) {
    console.error(error);
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
      const tempToken = jwt.sign({ id: user._id, twoFactorPending: true }, process.env.JWT_SECRET as string, { expiresIn: '5m' });
      return res.status(200).json({ twoFactorRequired: true, tempToken });
    }
    const token = generateToken(user._id);
    // Update online status via Redis
    await redisClient.set(`user:${user._id}:socket`, 'connected', { EX: 60 });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyTwoFactor = async (req: Request, res: Response) => {
  try {
    const { tempToken, code } = req.body;
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET as string) as any;
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });
    if (!verified) return res.status(401).json({ message: 'Invalid 2FA code' });
    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const setupTwoFactor = async (req: Request & { user?: any }, res: Response) => {
  try {
    const secret = speakeasy.generateSecret({ length: 20 });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.twoFactorSecret = secret.base32;
    await user.save();
    const otpauthUrl = speakeasy.otpauthURL({ secret: secret.ascii, label: `Nexora:${user.email}`, issuer: 'Nexora' });
    const qrCode = await QRCode.toDataURL(otpauthUrl);
    res.json({ secret: secret.base32, qrCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const enableTwoFactor = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id);
    if (!user || !user.twoFactorSecret) return res.status(400).json({ message: '2FA not set up' });
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });
    if (!verified) return res.status(401).json({ message: 'Invalid code' });
    user.twoFactorEnabled = true;
    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
