import { Router } from 'express';
import { health } from '../../controllers/messageController';

const router = Router();
router.get('/', health);

export default router;
