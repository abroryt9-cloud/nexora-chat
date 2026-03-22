import { IUser } from '@nexora/shared';

declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id: string };
    }
  }
}
