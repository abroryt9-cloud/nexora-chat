import { Router } from 'express';
import { health } from '../../controllers/chatController';

const router = Router();
router.get('/', health);

export default router;
