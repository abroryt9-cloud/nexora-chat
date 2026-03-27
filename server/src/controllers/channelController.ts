import { Request, Response } from 'express';

export const health = (_req: Request, res: Response): void => {
  res.json({ ok: true, module: 'channelController' });
};
