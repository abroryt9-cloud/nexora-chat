import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Chat, Poll, ScheduledMessage } from '../models/Chat';
import Message from '../models/Message';
import User from '../models/User';
import { redisClient } from '../config/redis';

// Get all chats for user
export const getChats = async (req: AuthRequest, res: Response) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'username avatar isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        populate: { path: 'senderId', select: 'username avatar' }
      })
      .sort('-updatedAt');
    
    res.json({ success: true, chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new chat
export const createChat = async (req: AuthRequest, res: Response) => {
  try {
    const { participantId, type, name } = req.body;
    
    if (type === 'private') {
      // Check if chat already exists
      const existingChat = await Chat.findOne({
        type: 'private',
        participants: { $all: [req.user._id, participantId], $size: 2 },
      });
      
      if (existingChat) {
        return res.json({ success: true, chat: existingChat });
      }
    }
    
    const chat = await Chat.create({
      type,
      participants: [req.user._id, ...(participantId ? [participantId] : [])],
      name: type === 'group' ? name : undefined,
    });
    
    // Update user statistics
    await User.findByIdAndUpdate(req.user._id, { 
      $inc: { 'statistics.totalChats': 1 } 
    });
    
    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'username avatar isOnline');
    
    res.status(201).json({ success: true, chat: populatedChat });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages for chat
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await Message.find({ chatId, deleted: false })
      .populate('senderId', 'username avatar email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    
    const total = await Message.countDocuments({ chatId, deleted: false });
    
    res.json({
      success: true,
      messages: messages.reverse(),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, content, type, mediaUrl, replyTo, pollData } = req.body;
    
    const message = await Message.create({
      chatId,
      senderId: req.user._id,
      content,
      type: type || 'text',
      mediaUrl,
      replyTo,
      pollData,
    });
    
    await Chat.findByIdAndUpdate(chatId, { 
      lastMessage: message._id, 
      updatedAt: new Date() 
    });
    
    // Update user statistics
    const updateStats: any = { $inc: { 'statistics.totalMessages': 1 } };
    if (type === 'sticker') updateStats.$inc['statistics.stickersSent'] = 1;
    if (type === 'voice') updateStats.$inc['statistics.voiceMessagesSent'] = 1;
    
    await User.findByIdAndUpdate(req.user._id, updateStats);
    
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'username avatar');
    
    // Emit via WebSocket
    const io = req.app.get('io');
    io.to(chatId).emit('newMessage', populatedMessage);
    
    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Edit message
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
    
    res.json({ success: true, message });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete message
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
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add/remove reaction
export const addReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    const existingIndex = message.reactions.findIndex(
      r => r.userId.toString() === req.user._id.toString() && r.emoji === emoji
    );
    
    if (existingIndex !== -1) {
      // Remove reaction
      message.reactions.splice(existingIndex, 1);
    } else {
      // Add reaction
      message.reactions.push({ userId: req.user._id, emoji });
    }
    
    await message.save();
    
    const io = req.app.get('io');
    io.to(message.chatId.toString()).emit('reactionUpdated', { 
      messageId, 
      reactions: message.reactions 
    });
    
    // Update statistics
    if (existingIndex === -1) {
      await User.findByIdAndUpdate(req.user._id, { 
        $inc: { 'statistics.reactionsGiven': 1 } 
      });
    }
    
    res.json({ success: true, reactions: message.reactions });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create poll
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
    
    // Send poll as message
    const message = await Message.create({
      chatId,
      senderId: req.user._id,
      content: JSON.stringify({ 
        pollId: poll._id, 
        question, 
        options: poll.options 
      }),
      type: 'poll',
      pollData: {
        question,
        options: poll.options.map((o: any) => ({
          id: o._id.toString(),
          text: o.text,
          votes: o.votes,
        })),
        multiple: false,
      },
    });
    
    await Chat.findByIdAndUpdate(chatId, { 
      lastMessage: message._id, 
      updatedAt: new Date() 
    });
    
    await User.findByIdAndUpdate(req.user._id, { 
      $inc: { 'statistics.pollsCreated': 1 } 
    });
    
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'username avatar');
    
    const io = req.app.get('io');
    io.to(chatId).emit('newMessage', populatedMessage);
    
    res.status(201).json({ success: true, poll, message: populatedMessage });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Vote on poll
export const votePoll = async (req: AuthRequest, res: Response) => {
  try {
    const { pollId, optionIndex } = req.body;
    
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      return res.status(400).json({ message: 'Poll expired' });
    }
    
    const option = poll.options[optionIndex];
    if (!option) {
      return res.status(400).json({ message: 'Invalid option' });
    }
    
    // Remove existing vote from any option
    for (let opt of poll.options) {
      const idx = opt.votes.findIndex(
        v => v.toString() === req.user._id.toString()
      );
      if (idx !== -1) opt.votes.splice(idx, 1);
    }
    
    // Add vote to selected option
    option.votes.push(req.user._id);
    await poll.save();
    
    // Find and update the message
    const message = await Message.findOne({ 
      type: 'poll',
      'pollData.question': poll.question 
    });
    
    if (message) {
      const io = req.app.get('io');
      io.to(message.chatId.toString()).emit('pollUpdated', { 
        pollId, 
        options: poll.options 
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Vote poll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Schedule message
export const scheduleMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, content, scheduledFor, type, mediaUrl } = req.body;
    
    const scheduled = await ScheduledMessage.create({
      chatId,
      senderId: req.user._id,
      content,
      scheduledFor: new Date(scheduledFor),
      type: type || 'text',
      mediaUrl,
    });
    
    res.status(201).json({ success: true, scheduled });
  } catch (error) {
    console.error('Schedule message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get scheduled messages
export const getScheduledMessages = async (req: AuthRequest, res: Response) => {
  try {
    const scheduled = await ScheduledMessage.find({ 
      senderId: req.user._id,
      sent: false 
    }).sort('scheduledFor');
    
    res.json({ success: true, scheduled });
  } catch (error) {
    console.error('Get scheduled messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete scheduled message
export const deleteScheduledMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { scheduledId } = req.params;
    
    const scheduled = await ScheduledMessage.findOneAndDelete({
      _id: scheduledId,
      senderId: req.user._id,
    });
    
    if (!scheduled) {
      return res.status(404).json({ message: 'Scheduled message not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete scheduled message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Archive chat
export const archiveChat = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, participants: req.user._id },
      { isArchived: true },
      { new: true }
    );
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json({ success: true, chat });
  } catch (error) {
    console.error('Archive chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mute chat
export const muteChat = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { duration } = req.body; // in hours
    
    const mutedUntil = duration ? new Date(Date.now() + duration * 60 * 60 * 1000) : null;
    
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, participants: req.user._id },
      { isMuted: true, mutedUntil },
      { new: true }
    );
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json({ success: true, chat });
  } catch (error) {
    console.error('Mute chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
