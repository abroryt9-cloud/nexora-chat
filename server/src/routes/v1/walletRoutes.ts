import { Router } from 'express';
import { getWallet, sendTokens, getTransactions, getNXRPrice } from '../../controllers/walletController';
import { protect } from '../../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getWallet);
router.post('/send', sendTokens);
router.get('/transactions', getTransactions);
router.get('/price', getNXRPrice);

export default router;
