import { Request, Response } from 'express';
import { comparePassword, hashPassword } from '../utils/hash';
import { signAccessToken } from '../utils/jwt';
import { inMemoryStore, UserRole } from '../services/inMemoryStore';

const toAuthResponse = (userId: string, role: UserRole) => ({
  token: signAccessToken({ userId, role }),
});

export const demoLogin = async (req: Request, res: Response): Promise<void> => {
  const { phone = '', code = '' } = req.body as { phone?: string; code?: string };
  if (!phone || code !== '123456') {
    res.status(400).json({ message: 'Invalid demo credentials. Use any phone and code 123456.' });
    return;
  }

  const demoUsername = `demo_${phone.replace(/\D/g, '') || 'user'}`;
  let user = inMemoryStore.users.find((item) => item.username === demoUsername);

  if (!user) {
    user = inMemoryStore.createUser({
      email: `${demoUsername}@demo.nexora.app`,
      username: demoUsername,
      passwordHash: await hashPassword('demo-password'),
      role: 'user',
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });
  }

  res.json({ user, ...toAuthResponse(user.id, user.role) });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, username, password, role = 'user' } = req.body as {
    email?: string;
    username?: string;
    password?: string;
    role?: UserRole;
  };

  if (!email || !username || !password) {
    res.status(400).json({ message: 'email, username and password are required' });
    return;
  }

  const exists = inMemoryStore.users.some((item) => item.email === email || item.username === username);
  if (exists) {
    res.status(409).json({ message: 'User already exists' });
    return;
  }

  const user = inMemoryStore.createUser({
    email,
    username,
    passwordHash: await hashPassword(password),
    role,
    twoFactorEnabled: false,
    twoFactorSecret: null,
  });

  res.status(201).json({ user, ...toAuthResponse(user.id, user.role) });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { loginId, password } = req.body as { loginId?: string; password?: string };
  if (!loginId || !password) {
    res.status(400).json({ message: 'loginId and password are required' });
    return;
  }

  const user = inMemoryStore.users.find((item) => item.email === loginId || item.username === loginId);
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  res.json({ user, ...toAuthResponse(user.id, user.role) });
};

export const me = (req: Request, res: Response): void => {
  if (!req.userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const user = inMemoryStore.users.find((item) => item.id === req.userId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json({ user });
};

export const health = (_req: Request, res: Response): void => {
  res.json({ ok: true, module: 'authController' });
};
