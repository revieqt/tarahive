import { Request, Response } from 'express';
import { registerUser, sendVerificationCode, verifyUserEmail, loginUser } from './auth.service';
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
      return res.status(400).json({ success: false, message: 'Email is required' });
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

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, code, device } = req.body;
  try {
    
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    await verifyUserEmail(email, code);

    await LogAction.info({
      action: "EMAIL_VERIFICATION_SUCCESS",
      module: "auth",
      description: `Email verified for ${email}`,
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
      message: 'Email verified successfully' 
    });
  } catch (error: any) {
    const errorMsg = error.message || 'Failed to verify email';
    if (
      errorMsg.includes('Invalid') ||
      errorMsg.includes('expired')
    ) {
      await LogAction.error({
        action: "EMAIL_VERIFICATION_FAILED",
        module: "auth",
        description: `Failed to verify email ${email}`,
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
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or expired verification code' });
    }
    res.status(500).json({ success: false, message: errorMsg });
  }
};

/**
 * POST /auth/login
 * Login a user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await loginUser(req.body);

    if (result.success) {
      await LogAction.info({
        userId: result.user?.id,
        action: "USER_LOGGED_IN",
        module: "auth",
        description: `User logged in: ${result.user?.email}`,
        resourceType: "user",
        resourceId: result.user?.id,
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
    } else {
      await LogAction.error({
        action: "USER_LOGIN_FAILED",
        module: "auth",
        description: `Login failed for ${req.body.identifier}: ${result.message}`,
        resourceType: "user",
        success: false,
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
    }

    res.status(200).json(result);
  } catch (error: any) {
    await LogAction.error({
      action: "USER_LOGIN_ERROR",
      module: "auth",
      description: `Login error for ${req.body.identifier}: ${error.message}`,
      resourceType: "user",
      success: false,
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

    res.status(400).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};