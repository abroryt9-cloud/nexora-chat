import { Router } from 'express';
import { askAI } from '../../controllers/aiController';
import { protect } from '../../middleware/auth';

const router = Router();

router.use(protect);
router.post('/ask', askAI);

export default router;
