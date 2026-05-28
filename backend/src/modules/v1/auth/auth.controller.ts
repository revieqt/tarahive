import { Request, Response } from 'express';
import { registerUser, sendVerificationCode, verifyUserEmail, loginUser, updatePassword } from './auth.service';
import { LogAction } from '../audit/audit.service';
import { AuthRequest } from './auth.types';

/**
 * POST /auth/register
 * Register a new user - stores pending registration data and sends verification code
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await registerUser(req.body);

    await LogAction.info({
      action: "USER_REGISTRATION_INITIATED",
      module: "auth",
      description: `User registration initiated for ${result.email}`,
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
    
    res.status(200).json({
      success: true,
      message: res.locals.t('auth.register.registration_initiated'),
      email: result.email,
      nextStep: 'verify',
    });
  } catch (error: any) {
    const errorMsg = error.message || 'Registration failed';
    let localizationKey = 'auth.register.registration_failed';

    if (errorMsg.includes('Email already registered')) {
      localizationKey = 'auth.register.email_already_registered';
    } else if (errorMsg.includes('Password') || errorMsg.includes('password')) {
      localizationKey = 'auth.register.password_invalid';
    } else if (errorMsg.includes('13 years old')) {
      localizationKey = 'auth.register.age_error';
    }

    await LogAction.error({
      action: "USER_REGISTRATION_FAILED",
      module: "auth",
      description: `User registration failed: ${errorMsg}`,
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
      message: res.locals.t(localizationKey),
    });
  }
};

export const sendEmailVerification = async (req: Request, res: Response) => {
  const { email, device } = req.body;
  try {
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: res.locals.t('auth.verify_email.required_fields'),
      });
    }

    const code = await sendVerificationCode(email);
    
    await LogAction.info({
      action: "EMAIL_VERIFICATION_CODE_SENT",
      module: "auth",
      description: `Verification code sent (or resent) to ${email}`,
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
      message: res.locals.t('auth.verify_email.code_sent'),
      email: email,
     });
  } catch (error: any) {
    await LogAction.error({
      action: "EMAIL_VERIFICATION_CODE_FAILED",
      module: "auth",
      description: `Failed to send verification code to ${email}`,
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
      message: error.message || res.locals.t('auth.verify_email.code_sent'),
     });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, code, device } = req.body;
  try {
    
    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        message: res.locals.t('auth.verify_email.required_fields'),
      });
    }

    const user = await verifyUserEmail(email, code);

    await LogAction.info({
      userId: user.id,
      action: "EMAIL_VERIFICATION_SUCCESS",
      module: "auth",
      description: `Email verified and user created for ${email}`,
      resourceType: "user",
      resourceId: user.id,
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
      message: res.locals.t('auth.verify_email.success'),
      user,
    });
  } catch (error: any) {
    const errorMsg = error.message || 'Failed to verify email';
    let localizationKey = 'auth.verify_email.invalid_code';

    if (errorMsg.includes('No pending registration')) {
      localizationKey = 'auth.verify_email.no_pending_registration';
    } else if (errorMsg.includes('Invalid') || errorMsg.includes('expired')) {
      localizationKey = 'auth.verify_email.invalid_code';
    }

    await LogAction.error({
      action: "EMAIL_VERIFICATION_FAILED",
      module: "auth",
      description: `Failed to verify email ${email}: ${errorMsg}`,
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
    
    if (errorMsg.includes('Invalid') || errorMsg.includes('expired') || errorMsg.includes('No pending registration')) {
      return res.status(400).json({ 
        success: false, 
        message: res.locals.t(localizationKey),
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: res.locals.t(localizationKey),
    });
  }
};

/**
 * POST /auth/login
 * Authenticate user and return access/refresh tokens
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { identifier, password, device } = req.body;
  try {
    if (!identifier || !password) {
      return void res.status(400).json({
        success: false,
        message: res.locals.t('auth.login_auth.required_fields'),
      });
    }

    const result = await loginUser(req.body);

    await LogAction.info({
      userId: result.user.id,
      action: "USER_LOGIN_SUCCESS",
      module: "auth",
      description: `User login successful: ${identifier}`,
      resourceType: "user",
      resourceId: result.user.id,
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
      message: res.locals.t('auth.login_auth.success'),
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error: any) {
    const errorMsg = error.message || 'Login failed';
    let localizationKey = 'auth.login_auth.invalid_credentials';
    let statusCode = 400;

    if (errorMsg.includes('User account not found')) {
      localizationKey = 'auth.login_auth.user_not_found';
    } else if (errorMsg.includes('Account suspended')) {
      localizationKey = 'auth.login_auth.account_suspended';
    } else if (errorMsg.includes('is inactive')) {
      localizationKey = 'auth.login_auth.user_inactive';
    } else if (errorMsg.includes('Invalid') || errorMsg.includes('password')) {
      localizationKey = 'auth.login_auth.invalid_credentials';
    }

    await LogAction.warn({
      action: "USER_LOGIN_FAILED",
      module: "auth",
      description: `User login failed: ${errorMsg}`,
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

    res.status(statusCode).json({
      success: false,
      message: res.locals.t(localizationKey),
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { oldPassword, newPassword, confirmPassword, device } = req.body;
  const userId = req.user?.sub;
  try {
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    if (!oldPassword || !newPassword || !confirmPassword) return res.status(400).json({ error: 'All password fields are required' });
    
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    
    await LogAction.info({
      userId: userId,
      action: "PASSWORD_UPDATE_SUCCESS",
      module: "auth",
      description: `Password updated successfully for user: ${userId}`,
      resourceType: "user",
      resourceId: userId,
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
    
    await updatePassword(userId, oldPassword, newPassword, confirmPassword);
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    if (error.message === 'New passwords do not match') {
      await LogAction.warn({
        action: "PASSWORD_UPDATE_FAILED",
        module: "auth",
        description: `New passwords do not match for user: ${req.body.userId}`,
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
      return res.status(400).json({ error: 'New passwords do not match' });
    }
    if (error.message === 'Current password is incorrect') {
      await LogAction.warn({
        action: "PASSWORD_UPDATE_FAILED",
        module: "auth",
        description: `Current password is incorrect for user: ${req.body.userId}`,
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
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    await LogAction.warn({
        action: "PASSWORD_UPDATE_FAILED",
        module: "auth",
        description: `Failed to update password for user: ${req.body.userId}`,
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
    res.status(500).json({ error: error.message || 'Failed to update password' });
  }
};