import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  role: 'user' | 'moderator' | 'admin' | 'superadmin';
}

const accessSecret = process.env.JWT_SECRET || 'dev_access_secret';

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, accessSecret, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, accessSecret) as JwtPayload;
};
