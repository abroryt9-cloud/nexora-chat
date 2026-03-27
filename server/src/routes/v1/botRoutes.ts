import { Router } from 'express';
import { health } from '../../controllers/botController';

const router = Router();
router.get('/', health);

export default router;
