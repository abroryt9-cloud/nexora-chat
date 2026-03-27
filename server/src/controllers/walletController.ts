import { Request, Response } from 'express';
import { inMemoryStore } from '../services/inMemoryStore';

export const health = (_req: Request, res: Response): void => {
  res.json({ ok: true, module: 'walletController' });
};

export const getBalance = (req: Request, res: Response): void => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const user = inMemoryStore.users.find((item) => item.id === userId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json({ balance: user.walletBalance, currency: 'NXR' });
};

export const transfer = (req: Request, res: Response): void => {
  const userId = req.userId;
  const { toUsername, amount } = req.body as { toUsername?: string; amount?: number };

  if (!userId || !toUsername || !amount || amount <= 0) {
    res.status(400).json({ message: 'toUsername and positive amount are required' });
    return;
  }

  const from = inMemoryStore.users.find((item) => item.id === userId);
  const to = inMemoryStore.users.find((item) => item.username === toUsername);
  if (!from || !to) {
    res.status(404).json({ message: 'Sender or recipient not found' });
    return;
  }

  if (from.walletBalance < amount) {
    res.status(400).json({ message: 'Insufficient balance' });
    return;
  }

  from.walletBalance -= amount;
  to.walletBalance += amount;

  const transaction = inMemoryStore.createWalletTransaction({
    fromUserId: from.id,
    toUserId: to.id,
    amount,
  });

  res.status(201).json({ transaction, balance: from.walletBalance });
};

export const listTransactions = (req: Request, res: Response): void => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const transactions = inMemoryStore.walletTransactions.filter(
    (item) => item.fromUserId === userId || item.toUserId === userId,
  );

  res.json({ transactions });
};
