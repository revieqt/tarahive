import { Request, Response } from 'express';
import chatService from './chat.service';

/**
 * Chat Controller
 * Handles chat API requests
 */

/**
 * GET /api/chat/:roomId
 * Get messages for a room with pagination
 */
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, cursor } = req.query;

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    const messages = await chatService.getMessages(
      roomId,
      parseInt(limit as string) || 50,
      cursor as string | undefined
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get messages',
    });
  }
};

/**
 * POST /api/chat/:roomId/send
 * Send a message to a room
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { message } = req.body;

    if (!roomId || !message) {
      return res
        .status(400)
        .json({ error: 'Room ID and message are required' });
    }

    const userId = (req as any).user?.id;
    const userName = (req as any).user?.username || 'Anonymous';
    const userImage = (req as any).user?.profileImage;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await chatService.sendMessage(
      roomId,
      userId,
      userName,
      message,
      userImage
    );

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    });
  }
};

/**
 * PUT /api/chat/:roomId/messages/:messageId/seen
 * Mark a message as seen
 */
export const markMessageSeen = async (req: Request, res: Response) => {
  try {
    const { roomId, messageId } = req.params;
    const userId = (req as any).user?.id;

    if (!roomId || !messageId || !userId) {
      return res
        .status(400)
        .json({ error: 'Missing required parameters' });
    }

    await chatService.markMessageSeen(roomId, messageId, userId);

    res.json({ success: true, message: 'Message marked as seen' });
  } catch (error) {
    console.error('Error marking message as seen:', error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to mark message as seen',
    });
  }
};

/**
 * PUT /api/chat/:roomId/mark-all-seen
 * Mark all messages in room as seen
 */
export const markAllSeen = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user?.id;

    if (!roomId || !userId) {
      return res
        .status(400)
        .json({ error: 'Missing required parameters' });
    }

    await chatService.markAllMessagesSeen(roomId, userId);

    res.json({ success: true, message: 'All messages marked as seen' });
  } catch (error) {
    console.error('Error marking all messages as seen:', error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to mark messages as seen',
    });
  }
};

/**
 * DELETE /api/chat/:roomId/messages/:messageId
 * Delete a message
 */
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { roomId, messageId } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role || 'member';

    if (!roomId || !messageId) {
      return res
        .status(400)
        .json({ error: 'Room ID and Message ID are required' });
    }

    await chatService.deleteMessage(
      roomId,
      messageId,
      userId,
      userRole as 'member' | 'admin'
    );

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete message',
    });
  }
};

/**
 * GET /api/chat/:roomId/search
 * Search messages in a room
 */
export const searchMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { q } = req.query;

    if (!roomId || !q) {
      return res
        .status(400)
        .json({ error: 'Room ID and search query are required' });
    }

    const results = await chatService.searchMessages(roomId, q as string);

    res.json({ success: true, data: results, count: results.length });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search messages',
    });
  }
};

/**
 * GET /api/chat/:roomId/count
 * Get message count in room
 */
export const getMessageCount = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    const count = await chatService.getMessageCount(roomId);

    res.json({ success: true, count });
  } catch (error) {
    console.error('Error getting message count:', error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to get message count',
    });
  }
};

export default {
  getMessages,
  sendMessage,
  markMessageSeen,
  markAllSeen,
  deleteMessage,
  searchMessages,
  getMessageCount,
};
