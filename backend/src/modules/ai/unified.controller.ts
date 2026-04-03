import { Request, Response } from 'express';
import { AIChatService } from './chat.service';
import { intentDetector } from './intent.detector';
import { UnifiedAIResponse } from './ai.types';
import { generateAIItinerary, sanitizeLocations } from './itinerary.service';
import { formatDateToString } from '../../utils/formatDateToString';

interface AuthRequest extends Request {
  user?: any;
}

const aiChatService = new AIChatService();

export class UnifiedAIController {
  /**
   * Unified endpoint for all AI requests (chat and itinerary generation)
   * POST /api/ai/
   *
   * Request format:
   * - Header: accessToken (in Authorization header)
   * - Body: { message }
   *
   * Response format:
   * {
   *   success: boolean,
   *   message: string,
   *   type: 'chat' | 'itinerary',
   *   json?: any
   * }
   */
  static async handleAIRequest(req: AuthRequest, res: Response) {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required',
          type: 'chat',
        } as UnifiedAIResponse);
      }

      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in token',
          type: 'chat',
        } as UnifiedAIResponse);
      }

      const userId = req.user.userId;

      // Detect intent
      const intentDetection = intentDetector.detectIntent(message);
      console.log(`🎯 Intent detected: ${intentDetection.intent} (confidence: ${intentDetection.confidence})`);

      let response: UnifiedAIResponse;

      if (intentDetection.intent === 'itinerary') {
        // Handle itinerary creation
        response = await UnifiedAIController.handleItineraryCreation(message, userId);
      } else {
        // Handle chat
        response = await UnifiedAIController.handleChat(message, userId);
      }

      return res.json(response);
    } catch (err: any) {
      console.error('❌ AI controller error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to process request. ' + (err.message || 'Something went wrong'),
        type: 'chat',
      } as UnifiedAIResponse);
    }
  }

  /**
   * Handle chat requests
   */
  private static async handleChat(message: string, userId: string): Promise<UnifiedAIResponse> {
    try {
      const reply = await aiChatService.getResponse(message, userId);

      return {
        success: true,
        message: reply,
        type: 'chat',
      };
    } catch (err: any) {
      console.error('❌ Chat error:', err.message);
      throw err;
    }
  }

  /**
   * Handle itinerary creation requests
   * Extracts destination and dates from message
   * If complete, generates itinerary immediately
   * If incomplete, asks user for missing details
   */
  private static async handleItineraryCreation(
    message: string,
    userId: string
  ): Promise<UnifiedAIResponse> {
    try {
      console.log('🟡 Parsing itinerary request for user:', userId);

      // Extract destination and dates from message
      const extractedData = UnifiedAIController.extractItineraryData(message);
      console.log('📍 Extracted data:', extractedData);

      // Check if we have essential fields to generate itinerary
      if (extractedData.destination && extractedData.startDate && extractedData.endDate) {
        // We have enough data to generate itinerary
        return await UnifiedAIController.generateItineraryWithData(extractedData);
      } else {
        // Missing data - ask user for details
        return await UnifiedAIController.askForItineraryDetails(extractedData, message, userId);
      }
    } catch (err: any) {
      console.error('❌ Itinerary creation error:', err.message);
      throw err;
    }
  }

  /**
   * Extract destination and dates from user message
   */
  private static extractItineraryData(message: string): Partial<import('./ai.types').AIItineraryRequest> {
    const data: Partial<import('./ai.types').AIItineraryRequest> = {};

    // Try to extract destination (usually comes after "to", "for", "in", "visit")
    const destMatch = message.match(/(?:to|for|in|visit|at)\s+([A-Z][a-zA-Z\s]+?)(?:\s+(?:from|on|\d|$))/i);
    if (destMatch) {
      data.destination = destMatch[1].trim();
    }

    // Try to extract start date (various formats: "April 1", "1 April", "1st of April", "April 1-5")
    const dateMatch = message.match(
      /([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*[-–]\s*(\d{1,2}))?|\b(\d{1,2})\s+([A-Za-z]+)/i
    );

    if (dateMatch) {
      const monthStr = dateMatch[1] || dateMatch[5];
      const dayStr = dateMatch[2] || dateMatch[4];
      const endDayStr = dateMatch[3];

      // Get current year and month mapping
      const months: Record<string, number> = {
        january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
        july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
      };

      const monthNum = months[monthStr.toLowerCase()];
      if (monthNum) {
        const year = new Date().getFullYear();
        const day = parseInt(dayStr);
        
        // Format: YYYY-MM-DD
        const startDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        data.startDate = startDate;

        // If we have an end day, use it
        if (endDayStr) {
          const endDay = parseInt(endDayStr);
          data.endDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
        }
      }
    }

    // Default planDaily to true
    data.planDaily = true;

    return data;
  }

  /**
   * Generate itinerary with extracted data
   */
  private static async generateItineraryWithData(
    data: Partial<import('./ai.types').AIItineraryRequest>
  ): Promise<UnifiedAIResponse> {
    try {
      const itineraryRequest: import('./ai.types').AIItineraryRequest = {
        destination: data.destination || 'Unknown',
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || new Date().toISOString().split('T')[0],
        planDaily: data.planDaily ?? true,
        interests: data.interests || [],
      };

      console.log('🟡 Generating itinerary with data:', itineraryRequest);
      let itinerary = await generateAIItinerary(itineraryRequest);

      console.log('🟡 Sanitizing locations in itinerary...');
      itinerary = await sanitizeLocations(itinerary);

      return {
        success: true,
        message: `I have generated an itinerary template for ${data.destination} from ${data.startDate} to ${data.endDate}. You can customize it further if you approve it!`,
        type: 'itinerary',
        json: itinerary,
      };
    } catch (err: any) {
      console.error('❌ Error generating itinerary:', err.message);
      throw err;
    }
  }

  /**
   * Ask user for missing itinerary details using chat
   */
  private static async askForItineraryDetails(
    extractedData: Partial<import('./ai.types').AIItineraryRequest>,
    originalMessage: string,
    userId: string
  ): Promise<UnifiedAIResponse> {
    try {
      // Build context string about what we know and what we need
      let context = 'The user wants to create a trip itinerary.';
      
      if (extractedData.destination) {
        context += ` Destination: ${extractedData.destination}.`;
      }
      if (extractedData.startDate) {
        context += ` Start date: ${extractedData.startDate}.`;
      }
      if (extractedData.endDate) {
        context += ` End date: ${extractedData.endDate}.`;
      }

      context += '\nPlease help gather any missing information (destination if needed, travel dates, interests) by asking the user conversationally and naturally.';
      context += `\nUser message: "${originalMessage}"`;

      // Use chat service to ask for details
      const response = await aiChatService.getResponse(context, userId);

      return {
        success: true,
        message: response,
        type: 'itinerary',
      };
    } catch (err: any) {
      console.error('❌ Error asking for details:', err.message);
      throw err;
    }
  }
}

/**
 * OLD ENDPOINTS (KEPT AS REFERENCE - TO BE DEPRECATED)
 * These endpoints are kept for backward compatibility and as a guide
 */

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

      const response = await aiChatService.getResponse(message, userId);
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
