import { Request, Response } from 'express';
import { inMemoryStore } from '../services/inMemoryStore';

export const health = (_req: Request, res: Response): void => {
  res.json({ ok: true, module: 'messageController' });
};

export const listMessages = (req: Request, res: Response): void => {
  const userId = req.userId;
  const { chatId } = req.params;
  const page = Number(req.query.page || 1);
  const limit = 50;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const chat = inMemoryStore.chats.find((item) => item.id === chatId && item.participantIds.includes(userId));
  if (!chat) {
    res.status(404).json({ message: 'Chat not found' });
    return;
  }

  const all = inMemoryStore.messages.filter((item) => item.chatId === chatId);
  const start = (page - 1) * limit;
  const messages = all.slice(start, start + limit);

  res.json({ messages, total: all.length, page, limit });
};

export const sendMessage = (req: Request, res: Response): void => {
  const userId = req.userId;
  const { chatId } = req.params;
  const { text, replyToId = null } = req.body as { text?: string; replyToId?: string | null };

  if (!userId || !text) {
    res.status(400).json({ message: 'text is required' });
    return;
  }

  const chat = inMemoryStore.chats.find((item) => item.id === chatId && item.participantIds.includes(userId));
  if (!chat) {
    res.status(404).json({ message: 'Chat not found' });
    return;
  }

  const message = inMemoryStore.createMessage({
    chatId,
    senderId: userId,
    text,
    replyToId,
  });

  res.status(201).json({ message });
};

export const editMessage = (req: Request, res: Response): void => {
  const userId = req.userId;
  const { messageId } = req.params;
  const { text } = req.body as { text?: string };

  const message = inMemoryStore.messages.find((item) => item.id === messageId && item.senderId === userId);
  if (!message || !text) {
    res.status(404).json({ message: 'Message not found or text missing' });
    return;
  }

  message.text = text;
  message.editedAt = new Date().toISOString();

  res.json({ message });
};

export const reactToMessage = (req: Request, res: Response): void => {
  const userId = req.userId;
  const { messageId } = req.params;
  const { emoji } = req.body as { emoji?: string };

  if (!userId || !emoji) {
    res.status(400).json({ message: 'emoji is required' });
    return;
  }

  const message = inMemoryStore.messages.find((item) => item.id === messageId);
  if (!message) {
    res.status(404).json({ message: 'Message not found' });
    return;
  }

  const existing = message.reactions[emoji] || [];
  if (!existing.includes(userId)) {
    existing.push(userId);
  }
  message.reactions[emoji] = existing;

  res.json({ message });
};
