import { Router } from 'express';
import { health } from '../../controllers/webhookController';

const router = Router();
router.get('/', health);

export default router;
