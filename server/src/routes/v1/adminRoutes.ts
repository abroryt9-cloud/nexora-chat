import { Router } from 'express';
import { getUsers, deleteUser, getReports, resolveReport, getSystemStats, getSystemLogs } from '../../controllers/adminController';
import { protect, restrictTo } from '../../middleware/auth';

const router = Router();

router.use(protect);
router.use(restrictTo('admin', 'superadmin'));
router.get('/users', getUsers);
router.delete('/users/:userId', deleteUser);
router.get('/reports', getReports);
router.post('/reports/:reportId/resolve', resolveReport);
router.get('/stats', getSystemStats);
router.get('/logs', getSystemLogs);

export default router;
