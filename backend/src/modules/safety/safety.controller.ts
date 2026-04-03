import { Request, Response } from 'express';
import { disableSOS, findNearestAmenity } from './safety.service';
import { addSOSJob, SOSJobData } from './sos.queue';
import { logAction } from '../../utils/logAction';

interface AuthRequest extends Request {
  user?: any;
}

export const enableSOSController = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🚨 enableSOSController - Received SOS activation request');

    // Extract userID from authenticated request (via authMiddleware)
    const userID = req.user?.userId;
    if (!userID) {
      console.warn('⚠️ No authenticated user found');
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Extract emergency details from request body
    const { emergencyType, message, latitude, longitude, device } = req.body;

    // Validate required fields
    if (!emergencyType || typeof emergencyType !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Emergency type must be a valid string',
      });
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude are required',
      });
    }

    console.log(`🟡 Enqueueing SOS job for user ${userID}`);

    // Prepare job data
    const sosJobData: SOSJobData = {
      userID,
      emergencyType,
      message: message || undefined,
      latitude,
      longitude,
    };

    // Enqueue the SOS job for background processing
    const job = await addSOSJob(sosJobData);

    console.log(`✅ SOS job ${job.id} enqueued for user ${userID}`);

    // Log the SOS activation request
    await logAction(req, {
      action: 'ENABLE_SOS',
      module: 'SAFETY',
      description: `SOS activated - Type: ${emergencyType}${message ? `, Message: ${message}` : ''}`,
      severity: 'warning',
      metadataID: userID,
      userId: userID,
      device: device,
    });

    // Return immediate response to frontend (job is processing in background)
    return res.status(200).json({
      success: true,
      message: 'Emergency alert activated. Emergency contacts are being notified.',
      jobId: job.id,
    });
  } catch (error) {
    console.error('❌ Error in enableSOSController:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to activate SOS';
    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
};

export const disableSOSController = async (req: AuthRequest, res: Response) => {
  try {
    console.log('✅ disableSOSController - Received SOS deactivation request');

    // Extract userID from authenticated request (via authMiddleware)
    const userID = req.user?.userId;
    if (!userID) {
      console.warn('⚠️ No authenticated user found');
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Extract device info from request body
    const { device } = req.body;

    // Call service function
    const result = await disableSOS({
      accessToken: req.headers.authorization || '',
      userID,
    });

    // Log the SOS deactivation request
    await logAction(req, {
      action: 'DISABLE_SOS',
      module: 'SAFETY',
      description: 'SOS deactivated',
      severity: 'info',
      metadataID: userID,
      userId: userID,
      device: device,
    });

    return res.status(200).json({
      success: true,
      message: 'SOS deactivated successfully',
      data: result,
    });
  } catch (error) {
    console.error('❌ Error in disableSOSController:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate SOS';
    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
};

export const getNearestAmenity = async (req: Request, res: Response) => {
  try {
    const { amenity, latitude, longitude, tourism, aeroway } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'latitude and longitude are required.' });
    }
    
    if (!amenity && !tourism && !aeroway) {
      return res.status(400).json({ error: 'At least one of amenity, tourism, or aeroway must be provided.' });
    }
    
    const results = await findNearestAmenity(amenity, latitude, longitude, tourism, aeroway);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch amenities.' });
  }
};
