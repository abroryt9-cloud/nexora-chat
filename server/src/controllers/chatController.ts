import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Chat } from '../models/Chat';
import Message from '../models/Message';
import User from '../models/User';
import { Poll } from '../models/Chat';
import { ScheduledMessage } from '../models/Chat';
import { redisClient } from '../config/redis';

export const getChats = async (req: AuthRequest, res: Response) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'username avatar isOnline')
      .populate({
        path: 'lastMessage',
        populate: { path: 'senderId', select: 'username avatar' }
      })
      .sort('-updatedAt');
    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createChat = async (req: AuthRequest, res: Response) => {
  try {
    const { participantId, type, name } = req.body;
    if (type === 'private') {
      const existingChat = await Chat.findOne({
        type: 'private',
        participants: { $all: [req.user._id, participantId], $size: 2 },
      });
      if (existingChat) return res.json(existingChat);
    }
    const chat = await Chat.create({
      type,
      participants: [req.user._id, ...(participantId ? [participantId] : [])],
      name: type === 'group' ? name : undefined,
    });
    // Увеличить статистику пользователя
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'statistics.totalChats': 1 } });
    const populatedChat = await Chat.findById(chat._id).populate('participants', 'username avatar isOnline');
    res.status(201).json(populatedChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ chatId, deleted: false })
      .populate('senderId', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    const total = await Message.countDocuments({ chatId, deleted: false });
    res.json({
      messages: messages.reverse(),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, content, type, mediaUrl, replyTo } = req.body;
    const message = await Message.create({
      chatId,
      senderId: req.user._id,
      content,
      type: type || 'text',
      mediaUrl,
      replyTo,
    });
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id, updatedAt: new Date() });
    // Обновить статистику
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'statistics.totalMessages': 1 } });
    if (type === 'sticker') {
      await User.findByIdAndUpdate(req.user._id, { $inc: { 'statistics.stickersSent': 1 } });
    }
    if (type === 'voice') {
      await User.findByIdAndUpdate(req.user._id, { $inc: { 'statistics.voiceMessagesSent': 1 } });
    }
    const populatedMessage = await Message.findById(message._id).populate('senderId', 'username avatar');
    const io = req.app.get('io');
    io.to(chatId).emit('newMessage', populatedMessage);
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const editMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const message = await Message.findById(messageId);
    if (!message || message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();
    const io = req.app.get('io');
    io.to(message.chatId.toString()).emit('messageEdited', message);
    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message || (message.senderId.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    message.deleted = true;
    await message.save();
    const io = req.app.get('io');
    io.to(message.chatId.toString()).emit('messageDeleted', messageId);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    const existingIndex = message.reactions.findIndex(r => r.userId.toString() === req.user._id.toString() && r.emoji === emoji);
    if (existingIndex !== -1) {
      message.reactions.splice(existingIndex, 1);
    } else {
      message.reactions.push({ userId: req.user._id, emoji });
    }
    await message.save();
    const io = req.app.get('io');
    io.to(message.chatId.toString()).emit('reactionUpdated', { messageId, reactions: message.reactions });
    // Update statistics
    if (existingIndex === -1) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { 'statistics.reactionsGiven': 1 } });
    }
    res.json(message.reactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createPoll = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, question, options, expiresAt, isAnonymous } = req.body;
    const poll = await Poll.create({
      question,
      options: options.map((opt: string) => ({ text: opt, votes: [] })),
      createdBy: req.user._id,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isAnonymous,
    });
    // Send poll as a message
    const message = await Message.create({
      chatId,
      senderId: req.user._id,
      content: JSON.stringify({ pollId: poll._id, question, options: poll.options }),
      type: 'poll',
    });
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id, updatedAt: new Date() });
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'statistics.pollsCreated': 1 } });
    const populatedMessage = await Message.findById(message._id).populate('senderId', 'username avatar');
    const io = req.app.get('io');
    io.to(chatId).emit('newMessage', populatedMessage);
    res.status(201).json({ poll, message: populatedMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const votePoll = async (req: AuthRequest, res: Response) => {
  try {
    const { pollId, optionIndex } = req.body;
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    if (poll.expiresAt && new Date() > poll.expiresAt) return res.status(400).json({ message: 'Poll expired' });
    const option = poll.options[optionIndex];
    if (!option) return res.status(400).json({ message: 'Invalid option' });
    // Remove existing vote from any option
    for (let opt of poll.options) {
      const idx = opt.votes.findIndex(v => v.toString() === req.user._id.toString());
      if (idx !== -1) opt.votes.splice(idx, 1);
    }
    option.votes.push(req.user._id);
    await poll.save();
    const io = req.app.get('io');
    // Find the message containing this poll and emit update
    const message = await Message.findOne({ type: 'poll', content: { $regex: `"pollId":"${pollId}"` } });
    if (message) {
      io.to(message.chatId.toString()).emit('pollUpdated', { pollId, options: poll.options });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const scheduleMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, content, scheduledFor } = req.body;
    const scheduled = await ScheduledMessage.create({
      chatId,
      senderId: req.user._id,
      content,
      scheduledFor: new Date(scheduledFor),
    });
    res.status(201).json(scheduled);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
