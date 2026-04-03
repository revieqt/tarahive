import express from 'express';
import {
  getRooms,
  getSpecificRoom,
  createRoom,
  leaveRoom,
  updateRoomName,
  updateRoomImage,
  updateRoomColor,
  updateAttachedItinerary,
  unattachItinerary,
  inviteUser,
  approveInvite,
  updateNickname,
  requestToJoin,
  approveJoinRequest,
  changeUserNickname,
  kickUser,
  elevateToAdmin,
} from './room.controller';
import { authMiddleware } from '../../middleware/authMiddleware';
import { upload, processRoomImage } from '../../middleware/uploadMiddleware';

const router = express.Router();

/**
 * A. Get all rooms the user is a member of
 * GET /rooms
 */
router.get('/', authMiddleware, getRooms);

/**
 * B. Get specific room details
 * GET /rooms/view/:roomID
 */
router.get('/view/:roomID', authMiddleware, getSpecificRoom);

/**
 * C. Create a new room
 * POST /rooms/create
 * Body: { name, invitedMembers?: string[], itineraryID?: string }
 */
router.post('/create', authMiddleware, createRoom);

/**
 * D. Leave a room
 * POST /rooms/leave
 * Body: { roomID }
 */
router.post('/leave', authMiddleware, leaveRoom);

/**
 * E. Update room name
 * POST /rooms/update-name
 * Body: { roomID, name }
 */
router.post('/update-name', authMiddleware, updateRoomName);

/**
 * F. Update room image
 * POST /rooms/update-image
 * Body: { roomID }, File: image
 */
router.post('/update-image', authMiddleware, upload.single('image'), processRoomImage, updateRoomImage);

/**
 * G. Update room color
 * POST /rooms/update-color
 * Body: { roomID, color }
 */
router.post('/update-color', authMiddleware, updateRoomColor);

/**
 * H. Update attached itinerary
 * POST /rooms/update-itinerary
 * Body: { roomID, itineraryID }
 */
router.post('/update-itinerary', authMiddleware, updateAttachedItinerary);

/**
 * H1. Attach itinerary to room
 * POST /rooms/attach-itinerary
 * Body: { roomID, itineraryID }
 */
router.post('/attach-itinerary', authMiddleware, updateAttachedItinerary);

/**
 * H2. Unattach itinerary from room
 * POST /rooms/unattach-itinerary
 * Body: { roomID }
 */
router.post('/unattach-itinerary', authMiddleware, unattachItinerary);

/**
 * I. Invite user to room
 * POST /rooms/invite
 * Body: { roomID, userID }
 */
router.post('/invite', authMiddleware, inviteUser);

/**
 * J. Approve invite
 * POST /rooms/approve-invite
 * Body: { roomID, approval }
 */
router.post('/approve-invite', authMiddleware, approveInvite);

/**
 * K. Update user nickname
 * POST /rooms/update-nickname
 * Body: { roomID, userID, nickname }
 */
router.post('/update-nickname', authMiddleware, updateNickname);

/**
 * L. Request to join a room
 * POST /rooms/request-to-join
 * Body: { roomID }
 */
router.post('/request-to-join', authMiddleware, requestToJoin);

/**
 * M. Approve join request
 * POST /rooms/approve-join-request
 * Body: { roomID, userID, approval }
 */
router.post('/approve-join-request', authMiddleware, approveJoinRequest);

/**
 * N. Change user nickname
 * POST /rooms/change-user-nickname
 * Body: { roomID, userID, nickname }
 */
router.post('/change-user-nickname', authMiddleware, changeUserNickname);

/**
 * O. Kick user from room
 * POST /rooms/kick-user
 * Body: { roomID, userID }
 */
router.post('/kick-user', authMiddleware, kickUser);

/**
 * P. Elevate user to admin
 * POST /rooms/elevate-to-admin
 * Body: { roomID, userID }
 */
router.post('/elevate-to-admin', authMiddleware, elevateToAdmin);

export default router;
