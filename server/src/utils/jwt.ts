import jwt from 'jsonwebtoken';

export const signAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '1d' });
};

export const signRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
};
