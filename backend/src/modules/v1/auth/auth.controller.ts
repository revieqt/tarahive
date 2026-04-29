import { Request, Response } from 'express';
import { registerUser } from './auth.service';
import { LogAction } from '../audit/audit.service';

/**
 * POST /auth/register
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await registerUser(req.body);

    await LogAction.info({
      userId: user.id,
      action: "USER_REGISTERED",
      module: "auth",
      description: `New user registered: ${user.email}`,
      resourceType: "user",
      resourceId: user.id,
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
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};