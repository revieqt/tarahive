import { Request, Response } from 'express';
import { disableSOS, enableSOS, updateSafetySettings } from './sos.service';
import { LogAction } from '../../v1/audit/audit.service';
import { AuthRequest } from '../../v1/auth/auth.types';
import { t, detectLanguage } from '../localization/localization.service';

export const enableSOSController = async (req: AuthRequest, res: Response) => {
  const lang = detectLanguage(req.headers['accept-language']);
  try {
    const userID = req.user?.sub;
    const { emergencyType, message, latitude, longitude, device } = req.body;

    if (!userID) return res.status(401).json({ success: false, message: 'Authentication required' });

    if (!emergencyType || typeof emergencyType !== 'string') return res.status(400).json({ success: false, message: 'Emergency type must be a valid string'});

    if (typeof latitude !== 'number' || typeof longitude !== 'number') return res.status(400).json({ success: false, message: 'Valid latitude and longitude are required'});
    
    await enableSOS({
      userID,
      emergencyType,
      message,
      latitude,
      longitude,
    });

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

    return res.status(200).json({
      success: true,
      message: t('backend.emergency_alert.activated_success', lang),
    });

  } catch (error) {
    console.error('❌ Error in enableSOSController:', error);
    const errorMessage = error instanceof Error ? error.message : t('backend.emergency_alert.activated_failed', lang);
    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
};

export const disableSOSController = async (req: AuthRequest, res: Response) => {
  const lang = detectLanguage(req.headers['accept-language']);
  try {
    const userID = req.user?.sub;
    if (!userID) return res.status(401).json({ success: false, message: 'Authentication required' });

    await disableSOS({
      accessToken: req.headers.authorization || '',
      userID,
    });

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
      message: t('backend.emergency_alert.deactivated_success', lang),
    });
  } catch (error) {
    console.error('❌ Error in disableSOSController:', error);
    const errorMessage = error instanceof Error ? error.message : t('backend.emergency_alert.deactivated_failed', lang);
    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
};

export const updateSafetySettingsController = async (req: AuthRequest, res: Response): Promise<void> => {
  const lang = detectLanguage(req.headers['accept-language']);
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
      message: t('backend.emergency_alert.update_success', lang),
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || t('backend.emergency_alert.update_failed', lang),
    });
  }
};