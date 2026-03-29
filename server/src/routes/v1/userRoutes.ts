import { Router } from 'express';
import { getUserProfile, health, searchUsers, updateProfile } from '../../controllers/userController';
import { auth } from '../../middleware/auth';
import { validate, validationSchemas } from '../../middleware/validation';
import { generalLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Health check
router.get('/', health);

// Поиск пользователей
router.get('/search', 
  generalLimiter,
  auth, 
  searchUsers
);

// Получение профиля пользователя
router.get('/:userId', 
  generalLimiter,
  auth, 
  getUserProfile
);

// Обновление собственного профиля
router.patch('/me', 
  generalLimiter,
  auth, 
  validate(validationSchemas.user.updateProfile),
  updateProfile
);

export default router;
