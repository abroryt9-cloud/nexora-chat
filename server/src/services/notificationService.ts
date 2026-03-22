import { redisClient } from '../config/redis';
import User from '../models/User';
import { sendEmail } from './emailService';

export const sendPushNotification = async (userId: string, title: string, body: string) => {
  // Здесь интеграция с Firebase
  console.log(`Push to ${userId}: ${title} - ${body}`);
};

export const sendInAppNotification = async (userId: string, notification: any) => {
  const io = require('../app').io;
  io.to(`user:${userId}`).emit('notification', notification);
};

export const notifyNewMessage = async (chatId: string, message: any) => {
  const chat = await Chat.findById(chatId).populate('participants');
  for (const participant of chat.participants) {
    if (participant._id.toString() !== message.senderId.toString()) {
      await sendInAppNotification(participant._id, {
        type: 'new_message',
        chatId,
        message: message.content,
        sender: message.senderId,
      });
    }
  }
};
