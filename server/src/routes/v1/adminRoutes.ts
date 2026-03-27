import { Router } from 'express';
import { health } from '../../controllers/adminController';

const router = Router();
router.get('/', health);

export default router;
