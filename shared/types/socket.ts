export interface SocketEvents {
  // Messages
  newMessage: (message: IMessage) => void;
  messageEdited: (message: IMessage) => void;
  messageDeleted: (messageId: string) => void;
  reactionUpdated: (data: { messageId: string; reactions: IReaction[] }) => void;
  
  // Typing & Status
  userTyping: (data: { userId: string; isTyping: boolean }) => void;
  userOnline: (userId: string) => void;
  userOffline: (userId: string) => void;
  
  // Notifications
  notification: (notification: any) => void;
  
  // Video/Voice Calls
  callUser: (data: { to: string; signal: RTCSessionDescriptionInit; isVideo: boolean }) => void;
  answerCall: (data: { to: string; signal: RTCSessionDescriptionInit }) => void;
  endCall: (data: { to: string }) => void;
  incomingCall: (data: { from: string; signal: RTCSessionDescriptionInit; isVideo: boolean }) => void;
  callAnswered: (data: { from: string; signal: RTCSessionDescriptionInit }) => void;
  callEnded: () => void;
  iceCandidate: (data: { to: string; candidate: RTCIceCandidate }) => void;
}

export interface CallState {
  isActive: boolean;
  peerId: string;
  isVideo: boolean;
  status: 'connecting' | 'connected' | 'ended';
}
