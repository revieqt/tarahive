import express from 'express';
import { getMessages, createMessage, markMessagesSeen, sendSystemMessage } from './message.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = express.Router();

/**
 * A. Get messages for a room with cursor-based pagination
 * GET /api/messages/:roomId
 * Query params:
 *   - limit: number of messages to return (default: 20, max: 100)
 *   - cursor: timestamp cursor for pagination (optional)
 */
router.get('/:roomId', authMiddleware, getMessages);

/**
 * B. Create a message (fallback REST endpoint)
 * POST /api/messages
 * Body: { roomId, senderId, message }
 */
router.post('/', authMiddleware, createMessage);

/**
 * C. Mark messages as seen
 * POST /api/messages/mark-seen
 * Body: { roomId, messageIds }
 */
router.post('/mark-seen', authMiddleware, markMessagesSeen);

/**
 * D. Send system message to room
 * POST /api/messages/system
 * Headers: X-API-KEY (or Authorization Bearer admin-token)
 * Body: { roomId, message }
 */
router.post('/system', sendSystemMessage);

export default router;
