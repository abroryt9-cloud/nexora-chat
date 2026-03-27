import { Request, Response, NextFunction } from 'express';

export const errorHandler = (_req: Request, _res: Response, next: NextFunction): void => next();
