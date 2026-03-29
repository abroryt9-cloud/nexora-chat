import { Router } from 'express';
import { editMessage, health, listMessages, reactToMessage, sendMessage } from '../../controllers/messageController';
import { auth } from '../../middleware/auth';
import { validate, validationSchemas } from '../../middleware/validation';
import { generalLimiter, messageLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Health check
router.get('/', health);

// Получение сообщений чата
router.get('/:chatId', 
  generalLimiter,
  auth, 
  listMessages
);

// Отправка сообщения
router.post('/:chatId', 
  messageLimiter,
  auth, 
  validate(validationSchemas.message.send),
  sendMessage
);

// Редактирование сообщения
router.patch('/:messageId', 
  generalLimiter,
  auth, 
  validate(validationSchemas.message.edit),
  editMessage
);

// Реакция на сообщение
router.post('/:messageId/react', 
  generalLimiter,
  auth, 
  validate(validationSchemas.message.react),
  reactToMessage
);

export default router;
