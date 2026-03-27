import { Router } from 'express';
import authRoutes from './v1/authRoutes';
import chatRoutes from './v1/chatRoutes';
import messageRoutes from './v1/messageRoutes';
import userRoutes from './v1/userRoutes';
import walletRoutes from './v1/walletRoutes';
import stickerRoutes from './v1/stickerRoutes';
import statusRoutes from './v1/statusRoutes';
import channelRoutes from './v1/channelRoutes';
import botRoutes from './v1/botRoutes';
import callRoutes from './v1/callRoutes';
import folderRoutes from './v1/folderRoutes';
import aiRoutes from './v1/aiRoutes';
import adminRoutes from './v1/adminRoutes';
import webhookRoutes from './v1/webhookRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/chats', chatRoutes);
router.use('/messages', messageRoutes);
router.use('/users', userRoutes);
router.use('/wallet', walletRoutes);
router.use('/stickers', stickerRoutes);
router.use('/status', statusRoutes);
router.use('/channels', channelRoutes);
router.use('/bots', botRoutes);
router.use('/calls', callRoutes);
router.use('/folders', folderRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
