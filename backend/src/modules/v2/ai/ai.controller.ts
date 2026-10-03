import { Response } from 'express';
import { AuthRequest } from '../auth/auth.types';
import { aiService } from './ai.service';

export const getAiConversationController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { conversation, messages } = await aiService.getCurrentConversation(userId);

    return res.status(200).json({
      success: true,
      conversation,
      messages,
    });
  } catch (error: any) {
    console.error('Get AI conversation failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load the current AI conversation.',
    });
  }
};

export const sendAiMessageController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const message = typeof req.body?.message === 'string' ? req.body.message : '';
    const result = await aiService.sendMessage(userId, message);

    return res.status(200).json({
      success: true,
      conversationId: result.conversationId,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Send AI message failed:', error);
    return res.status(502).json({
      success: false,
      message: 'The AI assistant is temporarily unavailable.',
    });
  }
};

export const deleteAiConversationController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await aiService.resetConversation(userId);

    return res.status(200).json({
      success: true,
      message: 'Conversation reset successfully.',
    });
  } catch (error: any) {
    console.error('Reset AI conversation failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset the AI conversation.',
    });
  }
};
