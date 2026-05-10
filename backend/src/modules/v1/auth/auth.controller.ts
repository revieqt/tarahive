import { Request, Response } from 'express';
import { registerUser, sendVerificationCode, verifyUserEmail, loginUser, updatePassword } from './auth.service';
import { LogAction } from '../audit/audit.service';

interface AuthRequest extends Request {
  user?: {
    id?: string;
    email: string;
  };
}

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

/**
 * POST /auth/change-password
 * Change user password
 */
export const changePassword = async (req: AuthRequest, res: Response) => {
  const { oldPassword, newPassword, confirmPassword, device } = req.body;
  const userId = req.user?.id;
  try {
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required' });
    }

    // Password strength validation
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    await updatePassword(userId, oldPassword, newPassword, confirmPassword);

    await LogAction.info({
      userId: userId,
      action: "PASSWORD_UPDATE_SUCCESS",
      module: "auth",
      description: `User updated password: ${req.user?.email}`,
      resourceType: "user",
      resourceId: userId,
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
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    if (error.message === 'New passwords do not match') {
      await LogAction.info({
        userId: userId,
        action: "PASSWORD_UPDATE_ATTEMPT_FAILED",
        module: "auth",
        description: `User updated password: ${req.user?.email}`,
        resourceType: "user",
        resourceId: userId,
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

      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }
    if (error.message === 'Current password is incorrect') {
      await LogAction.info({
        userId: userId,
        action: "PASSWORD_UPDATE_ATTEMPT_FAILED",
        module: "auth",
        description: `Current password is incorrect`,
        resourceType: "user",
        resourceId: userId,
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
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    await LogAction.info({
      userId: userId,
      action: "PASSWORD_UPDATE_FAILED",
      module: "auth",
      description: `Failed to update password: ${error.message}`,
      resourceType: "user",
      resourceId: userId,
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
    res.status(500).json({ success: false, message: error.message || 'Failed to update password' });
  }
};