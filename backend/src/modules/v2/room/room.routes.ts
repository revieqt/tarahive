import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';
import { createRoomController, getRoomController } from './room.controller';

const router = Router();

router.post('/', rateLimiter('MODERATE'), authMiddleware, createRoomController);
router.get('/:id', rateLimiter('MODERATE'), authMiddleware, getRoomController);

export default router;