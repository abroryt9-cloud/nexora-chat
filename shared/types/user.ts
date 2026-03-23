export interface IUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'user' | 'moderator' | 'admin' | 'superadmin';
  isOnline: boolean;
  lastSeen: Date;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  wallet?: IWallet;
  achievements?: IAchievement[];
  statistics?: IUserStatistics;
  language: string;
  theme: string;
  bio?: string;
  status?: string;
}

export interface IWallet {
  address: string;
  balance: number; // NXR
  transactions: ITransaction[];
}

export interface ITransaction {
  id: string;
  type: 'send' | 'receive' | 'reward';
  amount: number;
  from: string;
  to: string;
  timestamp: Date;
  hash?: string;
}

export interface IAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export interface IUserStatistics {
  totalMessages: number;
  totalChats: number;
  reactionsGiven: number;
  stickersSent: number;
  voiceMessagesSent: number;
  pollsCreated: number;
}
