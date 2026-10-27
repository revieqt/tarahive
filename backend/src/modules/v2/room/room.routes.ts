import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../../../middleware/authMiddleware';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';
import {
  createRoomController,
  acceptRoomInviteController,
  approveRoomMembershipRequestController,
  cancelRoomMembershipRequestController,
  getRoomController,
  getRoomMembersController,
  getUserRoomsController,
  inviteRoomMemberController,
  requestRoomMembershipController,
  removeRoomInviteController,
  updateRoomController,
} from './room.controller';

const router = Router();

router.get('/', rateLimiter('MODERATE'), authMiddleware, getUserRoomsController);
router.post('/', rateLimiter('MODERATE'), authMiddleware, createRoomController);
router.post('/invite', rateLimiter('MODERATE'), authMiddleware, inviteRoomMemberController);
router.delete('/invite', rateLimiter('MODERATE'), authMiddleware, removeRoomInviteController);
router.post('/request', rateLimiter('MODERATE'), authMiddleware, requestRoomMembershipController);
router.delete('/request', rateLimiter('MODERATE'), authMiddleware, cancelRoomMembershipRequestController);
router.post('/request/approve', rateLimiter('MODERATE'), authMiddleware, approveRoomMembershipRequestController);
router.post('/invite/accept', rateLimiter('MODERATE'), authMiddleware, acceptRoomInviteController);
router.get('/:id/members', rateLimiter('MODERATE'), authMiddleware, getRoomMembersController);
router.get('/:id', rateLimiter('MODERATE'), optionalAuthMiddleware, getRoomController);
router.patch('/:id', rateLimiter('MODERATE'), authMiddleware, updateRoomController);

export default router;