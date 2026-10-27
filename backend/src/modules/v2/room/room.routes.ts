import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';
import {
  createRoomController,
  getRoomController,
  getRoomMembersController,
  getUserRoomsController,
  updateRoomController,
} from './room.controller';

const router = Router();

router.get('/', rateLimiter('MODERATE'), authMiddleware, getUserRoomsController);
router.post('/', rateLimiter('MODERATE'), authMiddleware, createRoomController);
router.get('/:id/members', rateLimiter('MODERATE'), authMiddleware, getRoomMembersController);
router.get('/:id', rateLimiter('MODERATE'), authMiddleware, getRoomController);
router.patch('/:id', rateLimiter('MODERATE'), authMiddleware, updateRoomController);

export default router;