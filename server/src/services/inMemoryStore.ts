import crypto from 'crypto';

export type UserRole = 'user' | 'moderator' | 'admin' | 'superadmin';

export interface UserRecord {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  createdAt: string;
  walletBalance: number;
}

export interface ChatRecord {
  id: string;
  title: string;
  type: 'direct' | 'group';
  participantIds: string[];
  mutedBy: string[];
  archivedBy: string[];
  createdAt: string;
}

export interface MessageRecord {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  replyToId: string | null;
  reactions: Record<string, string[]>;
  readBy: string[];
  createdAt: string;
  editedAt: string | null;
}

export interface WalletTransactionRecord {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  createdAt: string;
}

const id = (): string => crypto.randomUUID();

const now = (): string => new Date().toISOString();

export const inMemoryStore = {
  users: [] as UserRecord[],
  chats: [] as ChatRecord[],
  messages: [] as MessageRecord[],
  walletTransactions: [] as WalletTransactionRecord[],

  createUser(payload: Omit<UserRecord, 'id' | 'createdAt' | 'walletBalance'>): UserRecord {
    const user: UserRecord = {
      id: id(),
      createdAt: now(),
      walletBalance: 1000,
      ...payload,
    };
    this.users.push(user);
    return user;
  },

  createChat(payload: Omit<ChatRecord, 'id' | 'createdAt'>): ChatRecord {
    const chat: ChatRecord = {
      id: id(),
      createdAt: now(),
      ...payload,
    };
    this.chats.push(chat);
    return chat;
  },

  createMessage(payload: Omit<MessageRecord, 'id' | 'createdAt' | 'editedAt' | 'readBy' | 'reactions'>): MessageRecord {
    const message: MessageRecord = {
      id: id(),
      createdAt: now(),
      editedAt: null,
      readBy: [payload.senderId],
      reactions: {},
      ...payload,
    };
    this.messages.push(message);
    return message;
  },

  createWalletTransaction(payload: Omit<WalletTransactionRecord, 'id' | 'createdAt'>): WalletTransactionRecord {
    const transaction: WalletTransactionRecord = {
      id: id(),
      createdAt: now(),
      ...payload,
    };
    this.walletTransactions.push(transaction);
    return transaction;
  },
};

