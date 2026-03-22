import { Router } from 'express';
import authRoutes from './v1/authRoutes';
import chatRoutes from './v1/chatRoutes';
import userRoutes from './v1/userRoutes';
import walletRoutes from './v1/walletRoutes';
import nftRoutes from './v1/nftRoutes';
import adminRoutes from './v1/adminRoutes';
import aiRoutes from './v1/aiRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/chats', chatRoutes);
router.use('/users', userRoutes);
router.use('/wallet', walletRoutes);
router.use('/nft', nftRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);

export default router;
