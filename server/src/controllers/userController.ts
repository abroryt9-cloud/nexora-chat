import { Request, Response } from 'express';
import { inMemoryStore } from '../services/inMemoryStore';

export const health = (_req: Request, res: Response): void => {
  res.json({ ok: true, module: 'userController' });
};

export const searchUsers = (req: Request, res: Response): void => {
  const { query } = req.query as { query?: string };
  if (!query || typeof query !== 'string' || query.length < 2) {
    res.status(400).json({ message: 'Query must be at least 2 characters' });
    return;
  }

  const users = inMemoryStore.users
    .filter((user) => 
      user.username.toLowerCase().includes(query.toLowerCase()) || 
      user.email.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 20)
    .map((user) => ({ id: user.id, username: user.username, email: user.email }));

  res.json({ users });
};

export const getUserProfile = (req: Request, res: Response): void => {
  const { userId } = req.params;
  const user = inMemoryStore.users.find((item) => item.id === userId);
  
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const profile = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  res.json({ user: profile });
};

export const updateProfile = (req: Request, res: Response): void => {
  const currentUserId = req.userId;
  const { username, email } = req.body as { username?: string; email?: string };
  
  if (!currentUserId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const user = inMemoryStore.users.find((item) => item.id === currentUserId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Check if username or email is already taken by another user
  if (username && username !== user.username) {
    const exists = inMemoryStore.users.some((item) => item.id !== currentUserId && item.username === username);
    if (exists) {
      res.status(409).json({ message: 'Username already taken' });
      return;
    }
    user.username = username;
  }

  if (email && email !== user.email) {
    const exists = inMemoryStore.users.some((item) => item.id !== currentUserId && item.email === email);
    if (exists) {
      res.status(409).json({ message: 'Email already taken' });
      return;
    }
    user.email = email;
  }

  const profile = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  res.json({ user: profile });
};
