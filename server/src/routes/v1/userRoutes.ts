import { Router } from 'express';
import { getProfile, updateProfile, uploadAvatar, getUserStatistics, getAchievements } from '../../controllers/userController';
import { protect } from '../../middleware/auth';
import { upload } from '../../middleware/upload';

const router = Router();

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.get('/statistics', getUserStatistics);
router.get('/achievements', getAchievements);

export default router;
