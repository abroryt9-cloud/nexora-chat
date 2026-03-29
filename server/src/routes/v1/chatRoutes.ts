import { Router } from 'express';
import { archiveChat, createDirectChat, createGroupChat, health, listChats } from '../../controllers/chatController';
import { auth } from '../../middleware/auth';
import { validate, validationSchemas } from '../../middleware/validation';
import { generalLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Health check
router.get('/', health);

// Список чатов пользователя
router.get('/list', 
  generalLimiter,
  auth, 
  listChats
);

// Создание приватного чата
router.post('/direct', 
  generalLimiter,
  auth, 
  validate(validationSchemas.chat.createDirect),
  createDirectChat
);

// Создание группового чата
router.post('/group', 
  generalLimiter,
  auth, 
  validate(validationSchemas.chat.createGroup),
  createGroupChat
);

// Архивация чата
router.patch('/:chatId/archive', 
  generalLimiter,
  auth, 
  archiveChat
);

export default router;
