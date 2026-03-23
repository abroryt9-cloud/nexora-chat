export interface IReaction {
  userId: string;
  emoji: string;
}

export interface IMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
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
  isSticker?: boolean;
  isGif?: boolean;
  gifUrl?: string;
  isVoice?: boolean;
  voiceUrl?: string;
  isPoll?: boolean;
  pollData?: IPollData;
}

export interface IPollData {
  question: string;
  options: { id: string; text: string; votes: string[] }[];
  multiple: boolean;
  endsAt?: Date;
}
