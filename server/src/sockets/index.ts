import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { Chat } from '../models/Chat';
import { redisClient } from '../config/redis';

export const setupSocketHandlers = (io: Server) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.data.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const user = socket.data.user;
    await User.findByIdAndUpdate(user._id, { isOnline: true, lastSeen: new Date() });
    await redisClient.set(`user:${user._id}:socket`, socket.id, { EX: 60 });
    socket.join(`user:${user._id}`);
    
    // Присоединиться к комнатам чатов
    const chats = await Chat.find({ participants: user._id });
    chats.forEach(chat => socket.join(chat._id.toString()));

    // Chat events
    socket.on('joinChat', (chatId: string) => {
      socket.join(chatId);
    });

    socket.on('leaveChat', (chatId: string) => {
      socket.leave(chatId);
    });

    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(chatId).emit('userTyping', { userId: user._id, isTyping });
    });

    // Video/Voice Call events
    socket.on('callUser', ({ to, signal, isVideo }) => {
      socket.to(`user:${to}`).emit('incomingCall', { from: user._id, signal, isVideo });
    });

    socket.on('answerCall', ({ to, signal }) => {
      socket.to(`user:${to}`).emit('callAnswered', { from: user._id, signal });
    });

    socket.on('endCall', ({ to }) => {
      socket.to(`user:${to}`).emit('callEnded');
    });

    socket.on('iceCandidate', ({ to, candidate }) => {
      socket.to(`user:${to}`).emit('iceCandidate', { from: user._id, candidate });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(user._id, { isOnline: false, lastSeen: new Date() });
      await redisClient.del(`user:${user._id}:socket`);
      io.emit('userOffline', user._id);
    });
  });
};
