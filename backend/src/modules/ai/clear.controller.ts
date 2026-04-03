import { Request, Response } from 'express';
import { AIChatService } from './chat.service';

interface AuthRequest extends Request {
  user?: any;
}

const aiChatService = new AIChatService();

export class AIClearController {
  /**
   * Clear all AI conversation context for the authenticated user
   * POST /api/ai/clear
   *
   * Request format:
   * - Header: accessToken (in Authorization header)
   * - Body: empty or {}
   *
   * Response format:
   * {
   *   success: boolean,
   *   message: string
   * }
   */
  static async clearContext(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in token',
        });
      }

      const userId = req.user.userId;
      console.log(`🗑️ Clearing AI context for user: ${userId}`);

      await aiChatService.clearUserConversations(userId);

      return res.json({
        success: true,
        message: 'All conversation history has been cleared',
      });
    } catch (err: any) {
      console.error('❌ Error clearing context:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to clear conversation history',
      });
    }
  }
}
