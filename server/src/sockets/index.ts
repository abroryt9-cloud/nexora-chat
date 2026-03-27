import { Server } from 'socket.io';
import { registerChatSocket } from './chatSocket';
import { registerTypingSocket } from './typingSocket';
import { registerCallSocket } from './callSocket';
import { registerStatusSocket } from './statusSocket';

export const registerSockets = (io: Server): void => {
  registerChatSocket(io);
  registerTypingSocket(io);
  registerCallSocket(io);
  registerStatusSocket(io);
};
