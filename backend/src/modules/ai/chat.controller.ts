/**
 * @deprecated Use UnifiedAIController from unified.controller.ts instead
 * This controller is kept for reference only
 */

import { Request, Response } from 'express';
import { AIChatService } from './chat.service';

interface AuthRequest extends Request {
  user?: any;
}

const aiService = new AIChatService();

export class AIChatController {
  static async chat(req: AuthRequest, res: Response) {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'User ID not found in token' });
      }

      const userId = req.user.userId;

      const response = await aiService.getResponse(message, userId);
      return res.json({ reply: response });
    } catch (err: any) {
      console.error('❌ Chat controller error:', err.message);
      return res.status(500).json({
        error: 'Failed to get response',
        message: err.message || 'Something went wrong',
      });
    }
  }
}
