import { Router } from 'express';
import { demoLogin, health, login, me, register } from '../../controllers/authController';
import { auth } from '../../middleware/auth';
import { validate, validationSchemas } from '../../middleware/validation';
import { authLimiter, registerLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Health check
router.get('/', health);

// Демо вход (для тестирования)
router.post('/demo-login', 
  authLimiter,
  validate(validationSchemas.auth.demoLogin),
  demoLogin
);

// Регистрация
router.post('/register', 
  registerLimiter,
  validate(validationSchemas.auth.register),
  register
);

// Вход
router.post('/login', 
  authLimiter,
  validate(validationSchemas.auth.login),
  login
);

// Получение информации о текущем пользователе
router.get('/me', auth, me);

export default router;
