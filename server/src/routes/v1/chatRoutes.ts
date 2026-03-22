import { Router } from 'express';
import {
  getChats,
  createChat,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  createPoll,
  votePoll,
  scheduleMessage,
} from '../../controllers/chatController';
import { protect } from '../../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getChats);
router.post('/', createChat);
router.get('/:chatId/messages', getMessages);
router.post('/messages', sendMessage);
router.put('/messages/:messageId', editMessage);
router.delete('/messages/:messageId', deleteMessage);
router.post('/messages/:messageId/reactions', addReaction);
router.post('/polls', createPoll);
router.post('/polls/vote', votePoll);
router.post('/schedule', scheduleMessage);

export default router;
