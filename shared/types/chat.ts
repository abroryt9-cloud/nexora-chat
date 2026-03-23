export interface IChat {
  id: string;
  name?: string;
  type: 'personal' | 'group';
  participants: string[];
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isOnline?: boolean;
  typingUsers?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateChat {
  name?: string;
  type: 'personal' | 'group';
  participants: string[];
  avatar?: string;
}

export interface IUpdateChat {
  name?: string;
  avatar?: string;
  participants?: string[];
}
