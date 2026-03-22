import { IReaction } from './user';

export interface IMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'sticker' | 'gif' | 'voice' | 'poll';
  mediaUrl?: string;
  reactions: IReaction[];
  replyTo?: string;
  edited: boolean;
  editedAt?: Date;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReaction {
  userId: string;
  emoji: string;
}
