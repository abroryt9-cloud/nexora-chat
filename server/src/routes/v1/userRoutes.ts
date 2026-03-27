import { Router } from 'express';
import { health } from '../../controllers/userController';

const router = Router();
router.get('/', health);

export default router;
