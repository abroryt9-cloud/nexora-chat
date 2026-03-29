import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

// Общий rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов за окно
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many requests from this IP, please try again later.',
    });
  },
});

// Строгий лимит для аутентификации
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток входа за окно
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many authentication attempts, please try again later.',
    });
  },
});

// Лимит для отправки сообщений
export const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 30, // максимум 30 сообщений в минуту
  message: {
    error: 'Too many messages sent, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Message rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many messages sent, please slow down.',
    });
  },
});

// Лимит для переводов кошелька
export const walletLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 минут
  max: 10, // максимум 10 переводов за 5 минут
  message: {
    error: 'Too many wallet transactions, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Wallet rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many wallet transactions, please try again later.',
    });
  },
});

// Лимит для регистрации
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 3, // максимум 3 регистрации в час с одного IP
  message: {
    error: 'Too many registration attempts from this IP.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Registration rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many registration attempts from this IP.',
    });
  },
});
