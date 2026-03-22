import mongoose, { Schema, Document } from 'mongoose';
import { IUser, IWallet, IAchievement, IUserStatistics } from '@nexora/shared';

const TransactionSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['send', 'receive', 'reward'], required: true },
  amount: { type: Number, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  hash: String,
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
});

const WalletSchema = new Schema<IWallet>({
  address: { type: String, unique: true, required: true },
  balance: { type: Number, default: 0 },
  transactions: [TransactionSchema],
});

const AchievementSchema = new Schema<IAchievement>({
  id: String,
  name: String,
  description: String,
  icon: String,
  unlockedAt: Date,
});

const UserStatisticsSchema = new Schema<IUserStatistics>({
  totalMessages: { type: Number, default: 0 },
  totalChats: { type: Number, default: 0 },
  reactionsGiven: { type: Number, default: 0 },
  stickersSent: { type: Number, default: 0 },
  voiceMessagesSent: { type: Number, default: 0 },
  pollsCreated: { type: Number, default: 0 },
});

const UserSchema = new Schema<IUser & Document>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'moderator', 'admin', 'superadmin'], default: 'user' },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: '' },
  wallet: { type: WalletSchema, default: () => ({ address: '', balance: 0, transactions: [] }) },
  achievements: [AchievementSchema],
  statistics: { type: UserStatisticsSchema, default: {} },
  language: { type: String, default: 'en' },
  theme: { type: String, default: 'dark' },
}, { timestamps: true });

export default mongoose.model<IUser & Document>('User', UserSchema);
