import { Router } from 'express';
import { health } from '../../controllers/stickerController';

const router = Router();
router.get('/', health);

export default router;
