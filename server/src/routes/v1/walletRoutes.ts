import { Router } from 'express';
import { getBalance, health, listTransactions, transfer } from '../../controllers/walletController';
import { auth } from '../../middleware/auth';
import { validate, validationSchemas } from '../../middleware/validation';
import { generalLimiter, walletLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Health check
router.get('/', health);

// Получение баланса кошелька
router.get('/balance', 
  generalLimiter,
  auth, 
  getBalance
);

// Перевод средств
router.post('/transfer', 
  walletLimiter,
  auth, 
  validate(validationSchemas.wallet.transfer),
  transfer
);

// История транзакций
router.get('/transactions', 
  generalLimiter,
  auth, 
  listTransactions
);

export default router;
