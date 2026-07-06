import { Router } from 'express';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { getAIResponseController } from './ai.controller';

const router = Router();

router.post('/create',rateLimiter('MODERATE'), authMiddleware, getAIResponseController);

export default router;
