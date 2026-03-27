import { Router } from 'express';
import { health } from '../../controllers/folderController';

const router = Router();
router.get('/', health);

export default router;
