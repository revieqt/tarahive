import { Request, Response } from 'express';
import {
  viewItineraryService,
  createItineraryService,
  updateItineraryService,
  deleteItineraryService,
  cancelItineraryService,
  markItineraryAsDoneService,
  repeatItineraryService,
  viewUserItinerariesService,
  updateItineraryPrivacyService,
} from './itinerary.service';
import { CreateItineraryRequest, UpdateItineraryRequest } from './itinerary.types';
import User from '../account/account.model';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * View a single itinerary
 * POST /api/itineraries/view
 */
export const viewItinerary = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 viewItinerary - req.user:', req.user);
    const { itineraryID } = req.body;

    // Validate required fields
    if (!itineraryID) {
      return res.status(400).json({
        message: 'Missing required field: itineraryID',
      });
    }

    const itinerary = await viewItineraryService(itineraryID);
    
    // Check if itinerary exists
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    
    // Resolve username from userID (optional)
    let itineraryData: any = itinerary.toObject ? itinerary.toObject() : itinerary;
    console.log('🟡 itinerary.userID:', itinerary.userID);
    
    try {
      const user = await User.findById(itinerary.userID);
      console.log('🟡 User found:', user ? 'Yes' : 'No');
      if (user) {
        console.log('🟡 User username:', user.username);
        itineraryData.username = user.username;
      }
    } catch (userError) {
      console.warn('⚠️ Could not fetch username for user:', itinerary.userID, userError);
      // Continue without username - it's optional
    }
    
    console.log('🟡 Final itineraryData with username:', itineraryData.username);

    res.status(200).json({
      message: 'Itinerary retrieved successfully',
      data: itineraryData,
    });
  } catch (error) {
    console.error('❌ Error viewing itinerary:', error);
    if (error instanceof Error && error.message === 'Itinerary not found') {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create a new itinerary
 * POST /api/itineraries/create
 */
export const createItinerary = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 createItinerary - req.user:', req.user);
    const { title, type, description, startDate, endDate, planDaily, locations } = req.body;

    // Get userID from authenticated token
    const userID = req.user?.userId || req.user?.id;
    if (!userID) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate required fields
    if (!title || !type || !startDate || !endDate || planDaily === undefined || !locations) {
      return res.status(400).json({
        message: 'Missing required fields: title, type, startDate, endDate, planDaily, locations',
      });
    }

    if (!Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({ message: 'Locations must be a non-empty array' });
    }

    // Validate locations based on planDaily flag
    if (planDaily) {
      // Should be array of DailyItinerary
      const isValidDailyFormat = (locations as any[]).every(
        (item) => item.date && Array.isArray(item.locations)
      );
      if (!isValidDailyFormat) {
        return res.status(400).json({
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
      message: 'Itinerary created successfully',
      data: newItinerary,
    });
  } catch (error) {
    console.error('❌ Error creating itinerary:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update an itinerary
 * PATCH /api/itineraries/update/:itineraryID
 */
export const updateItinerary = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 updateItinerary - req.user:', req.user);
    const { itineraryID } = req.params;
    const itineraryIDStr = (Array.isArray(itineraryID) ? itineraryID[0] : itineraryID) as string;
    const updateData = req.body;

    if (!itineraryIDStr) {
      return res.status(400).json({ message: 'Itinerary ID is required' });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    // Convert date strings to Date objects if present
    const processedData: UpdateItineraryRequest = {
      ...updateData,
    };

    if (updateData.startDate) {
      processedData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      processedData.endDate = new Date(updateData.endDate);
    }

    const updatedItinerary = await updateItineraryService(itineraryIDStr, processedData);

    res.status(200).json({
      message: 'Itinerary updated successfully',
      data: updatedItinerary,
    });
  } catch (error) {
    console.error('❌ Error updating itinerary:', error);
    if (error instanceof Error && error.message === 'Itinerary not found') {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete an itinerary
 * DELETE /api/itineraries/delete/:itineraryID
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

/**
 * Cancel an itinerary
 * PATCH /api/itineraries/cancel/:itineraryID
 */
export const cancelItinerary = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 cancelItinerary - req.user:', req.user);
    const { itineraryID } = req.params;
    const itineraryIDStr = (Array.isArray(itineraryID) ? itineraryID[0] : itineraryID) as string;

    if (!itineraryIDStr) {
      return res.status(400).json({ message: 'Itinerary ID is required' });
    }

    const cancelledItinerary = await cancelItineraryService(itineraryIDStr);

    res.status(200).json({
      message: 'Itinerary cancelled successfully',
      data: cancelledItinerary,
    });
  } catch (error) {
    console.error('❌ Error cancelling itinerary:', error);
    if (error instanceof Error && error.message === 'Itinerary not found') {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Mark an itinerary as done
 * PATCH /api/itineraries/mark-done/:itineraryID
 */
export const markItineraryAsDone = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 markItineraryAsDone - req.user:', req.user);
    const { itineraryID } = req.params;
    const itineraryIDStr = (Array.isArray(itineraryID) ? itineraryID[0] : itineraryID) as string;

    if (!itineraryIDStr) {
      return res.status(400).json({ message: 'Itinerary ID is required' });
    }

    const doneItinerary = await markItineraryAsDoneService(itineraryIDStr);

    res.status(200).json({
      message: 'Itinerary marked as done successfully',
      data: doneItinerary,
    });
  } catch (error) {
    console.error('❌ Error marking itinerary as done:', error);
    if (error instanceof Error && error.message === 'Itinerary not found') {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Repeat an itinerary (update with new dates and set status to 'active')
 * PATCH /api/itineraries/repeat/:itineraryID
 */
export const repeatItinerary = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 repeatItinerary - req.user:', req.user);
    const { itineraryID } = req.params;
    const itineraryIDStr = (Array.isArray(itineraryID) ? itineraryID[0] : itineraryID) as string;
    const updateData = req.body;

    if (!itineraryIDStr) {
      return res.status(400).json({ message: 'Itinerary ID is required' });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    // Convert date strings to Date objects if present
    const processedData = {
      ...updateData,
    };

    if (updateData.startDate) {
      processedData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      processedData.endDate = new Date(updateData.endDate);
    }

    const repeatedItinerary = await repeatItineraryService(itineraryIDStr, processedData);

    res.status(200).json({
      message: 'Itinerary repeated successfully',
      data: repeatedItinerary,
    });
  } catch (error) {
    console.error('❌ Error repeating itinerary:', error);
    if (error instanceof Error && error.message === 'Itinerary not found') {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * View all itineraries for the authenticated user
 * GET /api/itineraries/user/all
 */
export const viewUserItineraries = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 viewUserItineraries - req.user:', req.user);

    // Get userID from authenticated token
    const userID = req.user?.userId || req.user?.id;
    if (!userID) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const itineraries = await viewUserItinerariesService(userID);

    res.status(200).json({
      message: 'User itineraries retrieved successfully',
      data: itineraries,
    });
  } catch (error) {
    console.error('❌ Error viewing user itineraries:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update itinerary privacy (toggle isPrivate)
 * PATCH /api/itineraries/update-privacy/:itineraryID
 */
export const updateItineraryPrivacy = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🟡 updateItineraryPrivacy - req.user:', req.user);
    const { itineraryID } = req.params;
    const itineraryIDStr = (Array.isArray(itineraryID) ? itineraryID[0] : itineraryID) as string;

    if (!itineraryIDStr) {
      return res.status(400).json({ message: 'Itinerary ID is required' });
    }

    const updatedItinerary = await updateItineraryPrivacyService(itineraryIDStr);

    res.status(200).json({
      message: 'Itinerary privacy updated successfully',
      data: updatedItinerary,
    });
  } catch (error) {
    console.error('❌ Error updating itinerary privacy:', error);
    if (error instanceof Error && error.message === 'Itinerary not found') {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
