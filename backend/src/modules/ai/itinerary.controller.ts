/**
 * @note This controller is still used by the old /api/ai/itinerary endpoint
 * It's also integrated into the unified flow through the UnifiedAIController
 * The itinerary service is separate from chat as requested
 */

import { Request, Response } from 'express';
import { generateAIItinerary, sanitizeLocations } from "./itinerary.service";
import { AIItineraryRequest } from "./ai.types";
import { formatDateToString } from '../../utils/formatDateToString';

export const createAIItinerary = async (req: Request, res: Response) => {
  try {
    const body: AIItineraryRequest = req.body;

    if (!body.destination || !body.startDate || !body.endDate) {
      return res.status(400).json({
        message: "destination, startDate, endDate are required",
      });
    }

    console.log('🟡 Generating AI itinerary for:', body.destination);
    let itinerary = await generateAIItinerary(body);

    console.log('🟡 Sanitizing locations in itinerary...');
    itinerary = await sanitizeLocations(itinerary);

    return res.json({
      success: true,
      message: `I have generated an itinerary template for ${body.destination} from ${formatDateToString(body.startDate)} to ${formatDateToString(body.endDate)}. You can customize it further if you approve it!`,
      data: itinerary,
    });
  } catch (error) {
    console.error("AI Itinerary Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI itinerary",
    });
  }
};