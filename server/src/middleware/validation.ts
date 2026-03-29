import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';
import { logger } from '../utils/logger';

// Базовые схемы валидации
const authSchemas = {
  demoLogin: yup.object({
    body: yup.object({
      phone: yup.string().required('Phone is required'),
      code: yup.string().length(6, 'Code must be 6 characters').required('Code is required'),
    }),
  }),
  
  register: yup.object({
    body: yup.object({
      email: yup.string().email('Invalid email').required('Email is required'),
      username: yup.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long').required('Username is required'),
      password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
      role: yup.string().oneOf(['user', 'moderator', 'admin', 'superadmin']).optional(),
    }),
  }),
  
  login: yup.object({
    body: yup.object({
      loginId: yup.string().required('Email or username is required'),
      password: yup.string().required('Password is required'),
    }),
  }),
};

const chatSchemas = {
  createDirect: yup.object({
    body: yup.object({
      usernameOrEmail: yup.string().required('Username or email is required'),
    }),
  }),
  
  createGroup: yup.object({
    body: yup.object({
      title: yup.string().min(1, 'Title is required').max(100, 'Title too long').required('Title is required'),
      participantIds: yup.array().of(yup.string()).optional(),
    }),
  }),
};

const messageSchemas = {
  send: yup.object({
    body: yup.object({
      text: yup.string().min(1, 'Message cannot be empty').max(4096, 'Message too long').required('Text is required'),
      replyToId: yup.string().optional().nullable(),
    }),
  }),
  
  edit: yup.object({
    body: yup.object({
      text: yup.string().min(1, 'Message cannot be empty').max(4096, 'Message too long').required('Text is required'),
    }),
  }),
  
  react: yup.object({
    body: yup.object({
      emoji: yup.string().required('Emoji is required'),
    }),
  }),
};

const walletSchemas = {
  transfer: yup.object({
    body: yup.object({
      toUsername: yup.string().required('Recipient username is required'),
      amount: yup.number().positive('Amount must be positive').max(1000000, 'Amount too large').required('Amount is required'),
    }),
  }),
};

const userSchemas = {
  updateProfile: yup.object({
    body: yup.object({
      username: yup.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long').optional(),
      email: yup.string().email('Invalid email').optional(),
    }),
  }),
};

// Функция для создания валидационного middleware
export const validate = (schema: yup.AnySchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      }, { abortEarly: false });
      
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors = error.inner.map((err) => ({
          field: err.path,
          message: err.message,
        }));
        
        logger.debug('Validation error:', errors);
        res.status(400).json({ 
          message: 'Validation failed', 
          errors 
        });
      } else {
        logger.error('Unexpected validation error:', error);
        res.status(500).json({ message: 'Internal validation error' });
      }
    }
  };
};

// Экспорт схем для использования в роутах
export const validationSchemas = {
  auth: authSchemas,
  chat: chatSchemas,
  message: messageSchemas,
  wallet: walletSchemas,
  user: userSchemas,
};
