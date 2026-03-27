import { Router } from 'express';
import { health } from '../../controllers/channelController';

const router = Router();
router.get('/', health);

export default router;
