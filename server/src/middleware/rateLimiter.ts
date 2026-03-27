import { Request, Response, NextFunction } from 'express';

export const rateLimiter = (_req: Request, _res: Response, next: NextFunction): void => next();
