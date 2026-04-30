import { Request, Response } from 'express';
import { registerUser, sendVerificationCode } from './auth.service';
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
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

export const sendEmailVerification = async (req: Request, res: Response) => {
  const { email, device } = req.body;
  try {
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await sendVerificationCode(email);
    
    await LogAction.info({
      action: "EMAIL_VERIFICATION_CODE_SENT",
      module: "auth",
      description: `Verification code sent to ${email}`,
      resourceType: "user",
      success: true,
      ip: req.ip,
      platform: device?.type,
      device: {
        deviceId: device?.deviceId,
        brand: device?.brand,
        model: device?.model,
        os: device?.os,
      },
      appInfo: {
        appVersion: device?.appVersion,
      },
    });
    res.status(200).json({ 
      success: true,
      message: `Verification code sent to ${email}`
     });
  } catch (error: any) {
    await LogAction.error({
      action: "EMAIL_VERIFICATION_CODE_FAILED",
      module: "auth",
      description: `Verification code sent to ${email}`,
      resourceType: "user",
      success: false,
      ip: req.ip,
      platform: device?.type,
      device: {
        deviceId: device?.deviceId,
        brand: device?.brand,
        model: device?.model,
        os: device?.os,
      },
      appInfo: {
        appVersion: device?.appVersion,
      },
    });
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to send verification code'
     });
  }
};