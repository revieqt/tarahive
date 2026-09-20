import { Request, Response } from 'express';
import { sendVerificationCode, verifyUserEmail } from './auth.service';
import { LogAction } from '../audit/audit.service';

export const useEmailAuth = async (req: Request, res: Response) => {
  const { email, device } = req.body;
  try {
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: res.locals.t('auth.verify_email.required_fields'),
      });
    }

    await sendVerificationCode(email);
    
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