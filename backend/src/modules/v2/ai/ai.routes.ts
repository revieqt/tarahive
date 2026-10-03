import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';
import { deleteAiConversationController, getAiConversationController, sendAiMessageController } from './ai.controller';
import { handleAiChatValidation, validateAiChatRequest } from './schemas/chat.schema';

const router = Router();

router.get('/', rateLimiter('MODERATE'), authMiddleware, getAiConversationController);
router.post('/', rateLimiter('MODERATE'), authMiddleware, validateAiChatRequest, handleAiChatValidation, sendAiMessageController);
router.delete('/', rateLimiter('MODERATE'), authMiddleware, deleteAiConversationController);

export default router;
