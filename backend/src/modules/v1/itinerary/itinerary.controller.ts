import { Request, Response } from 'express';
import {
  createItineraryService,
  getItineraryService,
  getAllUserItinerariesService,
  deleteItineraryService,
} from './itinerary.service';
import { CreateItineraryRequest } from './itinerary.types';

interface AuthRequest extends Request {
  user?: {
    sub: string;
    tv: number;
    st: string;
  };
}

/**
 * Create a new itinerary
 * POST /v1/itinerary/create
 */
export const createItinerary = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 createItinerary - req.user:', req.user);
    const { title, type, description, startDate, endDate, planDaily, locations } = req.body;

    // Get userID from authenticated token 'sub' payload
    const userID = req.user?.sub;
    if (!userID) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Validate required fields
    if (!title || !type || !startDate || !endDate || planDaily === undefined || !locations) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, type, startDate, endDate, planDaily, locations',
      });
    }

    if (!Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({ success: false, message: 'Locations must be a non-empty array' });
    }

    // Validate locations based on planDaily flag
    if (planDaily) {
      // Should be array of DailyItinerary
      const isValidDailyFormat = (locations as any[]).every(
        (item) => item.date && Array.isArray(item.locations)
      );
      if (!isValidDailyFormat) {
        return res.status(400).json({
          success: false,
          message: 'When planDaily is true, locations must have date and locations array for each entry',
        });
      }
    } else {
      // Should be array of Location
      const isValidGeneralFormat = (locations as any[]).every(
        (item) => item.latitude !== undefined && item.longitude !== undefined && item.locationName
      );
      if (!isValidGeneralFormat) {
        return res.status(400).json({
          success: false,
          message: 'When planDaily is false, each location must have latitude, longitude, and locationName',
        });
      }
    }

    const itineraryData: CreateItineraryRequest = {
      title,
      type,
      description: description || '',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      planDaily,
      locations,
    };

    const newItinerary = await createItineraryService(userID, itineraryData);

    res.status(201).json({
      success: true,
      message: 'Itinerary created successfully',
      data: newItinerary,
    });
  } catch (error) {
    console.error('❌ Error creating itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get a specific itinerary by ID
 * GET /v1/itinerary/:id
 */
export const getItinerary = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 getItinerary - req.user:', req.user);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Get userID from authenticated token 'sub' payload
    const userID = req.user?.sub;
    if (!userID) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!id) {
      return res.status(400).json({ success: false, message: 'Itinerary ID is required' });
    }

    const itinerary = await getItineraryService(id, userID);

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Itinerary retrieved successfully',
      data: itinerary,
    });
  } catch (error) {
    console.error('❌ Error retrieving itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all user itineraries
 * GET /v1/itinerary
 */
export const getAllUserItineraries = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 getAllUserItineraries - req.user:', req.user);

    // Get userID from authenticated token 'sub' payload
    const userID = req.user?.sub;
    if (!userID) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const itineraries = await getAllUserItinerariesService(userID);

    res.status(200).json({
      success: true,
      message: 'User itineraries retrieved successfully',
      data: itineraries,
    });
  } catch (error) {
    console.error('❌ Error retrieving user itineraries:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete an itinerary
 * DELETE /v1/itinerary/delete/:itineraryID
 */
export const deleteItinerary = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 deleteItinerary - req.user:', req.user);
    const { itineraryID } = req.params;
    const itineraryIDStr = (Array.isArray(itineraryID) ? itineraryID[0] : itineraryID) as string;

    if (!itineraryIDStr) {
      return res.status(400).json({ message: 'Itinerary ID is required' });
    }

    await deleteItineraryService(itineraryIDStr);

    res.status(200).json({
      message: 'Itinerary deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting itinerary:', error);
    if (error instanceof Error && error.message === 'Itinerary not found') {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

  }
};