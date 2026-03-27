import { Router } from 'express';
import { health } from '../../controllers/callController';

const router = Router();
router.get('/', health);

export default router;
