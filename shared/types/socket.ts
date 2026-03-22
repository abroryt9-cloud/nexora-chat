export interface SocketEvents {
  newMessage: (message: IMessage) => void;
  messageEdited: (message: IMessage) => void;
  messageDeleted: (messageId: string) => void;
  reactionUpdated: (data: { messageId: string; reactions: IReaction[] }) => void;
  userTyping: (data: { userId: string; isTyping: boolean }) => void;
  userOnline: (userId: string) => void;
  userOffline: (userId: string) => void;
  notification: (notification: any) => void;
}
