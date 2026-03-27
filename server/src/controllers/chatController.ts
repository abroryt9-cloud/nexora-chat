import { Request, Response } from 'express';
import { inMemoryStore } from '../services/inMemoryStore';

export const health = (_req: Request, res: Response): void => {
  res.json({ ok: true, module: 'chatController' });
};

export const listChats = (req: Request, res: Response): void => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const chats = inMemoryStore.chats.filter((chat) => chat.participantIds.includes(userId));
  res.json({ chats });
};

export const createDirectChat = (req: Request, res: Response): void => {
  const userId = req.userId;
  const { usernameOrEmail } = req.body as { usernameOrEmail?: string };
  if (!userId || !usernameOrEmail) {
    res.status(400).json({ message: 'usernameOrEmail is required' });
    return;
  }

  const target = inMemoryStore.users.find((user) => user.username === usernameOrEmail || user.email === usernameOrEmail);
  if (!target) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const existing = inMemoryStore.chats.find(
    (chat) =>
      chat.type === 'direct' &&
      chat.participantIds.length === 2 &&
      chat.participantIds.includes(userId) &&
      chat.participantIds.includes(target.id),
  );

  if (existing) {
    res.json({ chat: existing });
    return;
  }

  const chat = inMemoryStore.createChat({
    title: `${target.username}`,
    type: 'direct',
    participantIds: [userId, target.id],
    mutedBy: [],
    archivedBy: [],
  });

  res.status(201).json({ chat });
};

export const createGroupChat = (req: Request, res: Response): void => {
  const userId = req.userId;
  const { title, participantIds = [] } = req.body as { title?: string; participantIds?: string[] };

  if (!userId || !title) {
    res.status(400).json({ message: 'title is required' });
    return;
  }

  const allParticipants = Array.from(new Set([userId, ...participantIds])).slice(0, 200);
  const chat = inMemoryStore.createChat({
    title,
    type: 'group',
    participantIds: allParticipants,
    mutedBy: [],
    archivedBy: [],
  });

  res.status(201).json({ chat });
};

export const archiveChat = (req: Request, res: Response): void => {
  const userId = req.userId;
  const { chatId } = req.params;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const chat = inMemoryStore.chats.find((item) => item.id === chatId && item.participantIds.includes(userId));
  if (!chat) {
    res.status(404).json({ message: 'Chat not found' });
    return;
  }

  if (!chat.archivedBy.includes(userId)) {
    chat.archivedBy.push(userId);
  }

  res.json({ chat });
};
