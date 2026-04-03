import express from 'express';
import {
  getMessages,
  sendMessage,
  markMessageSeen,
  markAllSeen,
  deleteMessage,
  searchMessages,
  getMessageCount,
} from './chat.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = express.Router();

/**
 * Chat API Routes
 * All routes require authentication (except get messages if public)
 */

/**
 * GET /api/chat/:roomId
 * Get messages for a room with pagination
 * Query params: limit (default 50), cursor (for pagination)
 */
router.get('/:roomId', getMessages);

/**
 * POST /api/chat/:roomId/send
 * Send a message to a room
 * Body: { message }
 */
router.post('/:roomId/send', authMiddleware, sendMessage);

/**
 * PUT /api/chat/:roomId/messages/:messageId/seen
 * Mark a message as seen
 */
router.put(
  '/:roomId/messages/:messageId/seen',
  authMiddleware,
  markMessageSeen
);

/**
 * PUT /api/chat/:roomId/mark-all-seen
 * Mark all messages in room as seen
 */
router.put('/:roomId/mark-all-seen', authMiddleware, markAllSeen);

/**
 * DELETE /api/chat/:roomId/messages/:messageId
 * Delete a message
 */
router.delete('/:roomId/messages/:messageId', authMiddleware, deleteMessage);

/**
 * GET /api/chat/:roomId/search
 * Search messages in a room
 * Query params: q (search query)
 */
router.get('/:roomId/search', searchMessages);

/**
 * GET /api/chat/:roomId/count
 * Get message count in room
 */
router.get('/:roomId/count', getMessageCount);

export default router;
