import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (plainTextPassword: string): Promise<string> => {
  return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
};

export const comparePassword = async (plainTextPassword: string, passwordHash: string): Promise<boolean> => {
  return bcrypt.compare(plainTextPassword, passwordHash);
};
