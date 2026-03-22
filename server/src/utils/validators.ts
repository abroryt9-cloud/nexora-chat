import * as yup from 'yup';

export const registerSchema = yup.object({
  username: yup.string().min(3).max(20).required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

export const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

export const twoFactorSchema = yup.object({
  tempToken: yup.string().required(),
  code: yup.string().length(6).required(),
});

export const messageSchema = yup.object({
  chatId: yup.string().required(),
  content: yup.string().required(),
  type: yup.string().oneOf(['text', 'image', 'sticker', 'gif', 'voice', 'poll']),
});
