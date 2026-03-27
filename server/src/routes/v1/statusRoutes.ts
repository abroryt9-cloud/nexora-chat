import { Router } from 'express';
import { health } from '../../controllers/statusController';

const router = Router();
router.get('/', health);

export default router;
