import { Request, Response } from 'express';
import { disableSOS, enableSOS, updateSafetySettings } from './sos.service';
import { LogAction } from '../../v1/audit/audit.service';
import { AuthRequest } from '../../v1/auth/auth.types';

export const enableSOSController = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🚨 enableSOSController - Received SOS activation request');

    // Extract userID from authenticated request (via authMiddleware)
    const userID = req.user?.sub;
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

    console.log(`🟡 Enabling SOS for user ${userID}`);

    const result = await enableSOS({
      userID,
      emergencyType,
      message,
      latitude,
      longitude,
    });

    console.log(`✅ SOS processing result for user ${userID}:`, result);

    // Log the SOS activation request
    await LogAction.info({
      action: "SOS_ACTIVATED",
      module: "auth",
      description: `SOS activated - Type: ${emergencyType}${message ? `, Message: ${message}` : ''}`,
      resourceType: "user",
      success: true,
      ip: req.ip,
      platform: req.body.device?.type,
      device: {
        deviceId: req.body.device?.deviceId,
        brand: req.body.device?.brand,
        model: req.body.device?.model,
        os: req.body.device?.os,
      },
      appInfo: {
        appVersion: req.body.device?.appVersion,
      },
    });

    // Return immediate response to frontend (job is processing in background)
    return res.status(200).json({
      success: true,
      message: 'Emergency alert activated. Emergency contacts are being notified.',
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
    const userID = req.user?.sub;
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
    await LogAction.info({
      action: "SOS_DEACTIVATED",
      module: "sos",
      description: `SOS deactivated for user ${userID}`,
      resourceType: "user",
      success: true,
      ip: req.ip,
      platform: req.body.device?.type,
      device: {
        deviceId: req.body.device?.deviceId,
        brand: req.body.device?.brand,
        model: req.body.device?.model,
        os: req.body.device?.os,
      },
      appInfo: {
        appVersion: req.body.device?.appVersion,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'SOS deactivated successfully',
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

export const updateSafetySettingsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.sub) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const delivery = req.body?.safetySettings?.delivery ?? req.body?.delivery;
    const emergencyContact = req.body?.safetySettings?.emergencyContact ?? req.body?.emergencyContact;

    if (!delivery || typeof delivery !== "object") {
      res.status(400).json({
        success: false,
        message: "Delivery settings are required",
      });
      return;
    }

    const user = await updateSafetySettings(req.user.sub, delivery, emergencyContact);

    res.status(200).json({
      success: true,
      message: "Safety settings updated successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update safety settings",
    });
  }
};