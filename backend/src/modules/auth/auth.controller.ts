import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { logAction } from '../../../utils/logAction';
import { registerUser, loginUser, sendVerificationCode, send2FACode, verifyUserEmail, verify2FA, sendPasswordResetCode, verifyAndResetPassword, resetPassword, updatePassword } from './auth.service';

interface AuthRequest extends Request {
  user?: {
    id?: string;
    userId?: string;
    email: string;
  };
}

export const login = async (req: Request, res: Response) => {
  const { identifier, password, app, device } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    const result = await loginUser(identifier, password, app);

    await logAction(req, {
      action: "LOGIN_SUCCESS",
      module: "AUTH",
      severity: "info",
      description: `Login success`,
      userId: result.user._id?.toString(),
      device: device,
      appInfo: { app: app, appVersion: req.body.device.appVersion }
    });

    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      await logAction(req, {
        action: "LOGIN_ATTEMPT_FAILED",
        module: "AUTH",
        severity: "warning",
        description: error,
        device: req.body.device,
        appInfo: { app: app, appVersion: req.body.device.appVersion }
      });
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }
    await logAction(req, {
      action: "LOGIN_FAILED",
      module: "AUTH",
      severity: "error",
      description: error,
      device: req.body.device,
      appInfo: { app: app, appVersion: req.body.device.appVersion }
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const passwordReset = async (req: Request, res: Response) => {
  try {
    const { userId, email, newPassword, device } = req.body;
    const identifier = userId || email;

    if (!identifier || !newPassword) {
      return res.status(400).json({ error: 'User identifier (ID or email) and new password are required' });
    }

    // Password strength validation
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    await resetPassword(identifier, newPassword);
    await logAction(req, {
      action: "PASSWORD_RESET_SUCCESS",
      module: "AUTH",
      severity: "info",
      description: `password reset success`,
      userId: userId,
      device: device,
    });
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error: any) {
    await logAction(req, {
      action: "PASSWORD_RESET_FAILED",
      module: "AUTH",
      severity: "error",
      description: `attempt to reset password failed`,
      userId: req.body.userId,
      device: req.body.device,
    });
    res.status(500).json({ error: error.message || 'Failed to reset password' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword, confirmPassword, device } = req.body;
    const userId = req.user?.id || req.user?.userId;

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

    await logAction(req, {
      action: "PASSWORD_UPDATE_SUCCESS",
      module: "AUTH",
      severity: "info",
      description: `password update success`,
      userId: userId,
      device: device,
    });
    await updatePassword(userId, oldPassword, newPassword, confirmPassword);
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    if (error.message === 'New passwords do not match') {
      await logAction(req, {
        action: "PASSWORD_UPDATE_ATTEMPT_FAILED",
        module: "AUTH",
        severity: "warning",
        description: `New passwords do not match`,
        userId: req.body.userId,
        device: req.body.device,
      });
      return res.status(400).json({ error: 'New passwords do not match' });
    }
    if (error.message === 'Current password is incorrect') {
      await logAction(req, {
        action: "PASSWORD_UPDATE_ATTEMPT_FAILED",
        module: "AUTH",
        severity: "warning",
        description: `Current password is incorrect`,
        userId: req.body.userId,
        device: req.body.device,
      });
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    await logAction(req, {
      action: "PASSWORD_UPDATE_FAILED",
      module: "AUTH",
      severity: "error",
      description: error,
      userId: req.body.userId,
      device: req.body.device,
    });
    res.status(500).json({ error: error.message || 'Failed to update password' });
  }
};

export const sendEmailVerification = async (req: Request, res: Response) => {
  try {
    const { email, device } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const code = await sendVerificationCode(email);
    await logAction(req, {
      action: "EMAIL_VERIFICATION_CODE_SENT",
      module: "AUTH",
      severity: "info",
      description: `verification code sent to ${email}`,
      userId: req.body.userId,
      device: device,
    });
    res.status(200).json({ code });
  } catch (error: any) {
    await logAction(req, {
      action: "EMAIL_VERIFICATION_CODE_FAILED",
      module: "AUTH",
      severity: "error",
      description: error,
      userId: req.body.userId,
      device: req.body.device,
    });
    res.status(500).json({ error: error.message || 'Failed to send verification code' });
  }
};

export const send2FA = async (req: Request, res: Response) => {
  try {
    const { email, device } = req.body;

    console.log(`📲 /send-2fa endpoint called:`, {
      email: email ? email.toLowerCase() : 'missing',
    });

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const code = await send2FACode(email);
    console.log(`   2FA code sent response:`, { email, codeLength: code.length });
    
    await logAction(req, {
      action: "2FA_CODE_SENT",
      module: "AUTH",
      severity: "info",
      description: `2FA code sent to ${email}`,
      userId: req.body.userId,
      device: device,
    });
    res.status(200).json({ code });
  } catch (error: any) {
    console.error(`   Error in send2FA:`, error.message);
    await logAction(req, {
      action: "2FA_CODE_SEND_FAILED",
      module: "AUTH",
      severity: "error",
      description: error,
      userId: req.body.userId,
      device: req.body.device,
    });
    res.status(500).json({ error: error.message || 'Failed to send 2FA code' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, code, device } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    await verifyUserEmail(email, code);
    await logAction(req, {
      action: "VERIFY_EMAIL_SUCCESS",
      module: "AUTH",
      severity: "info",
      description: email + ' verified successfully',
      userId: req.body.userId,
      device: device,
    });
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error: any) {
    const errorMsg = error.message || 'Failed to verify email';
    if (
      errorMsg.includes('Invalid') ||
      errorMsg.includes('expired')
    ) {
      await logAction(req, {
        action: "VERIFY_EMAIL_ATTEMPT_FAILED",
        module: "AUTH",
        severity: "warning",
        description: errorMsg,
        userId: req.body.userId,
        device: req.body.device,
      });
      return res
        .status(400)
        .json({ error: 'Invalid or expired verification code' });
    }
    await logAction(req, {
      action: "VERIFY_EMAIL_FAILED",
      module: "AUTH",
      severity: "error",
      description: errorMsg,
      userId: req.body.userId,
      device: req.body.device,
    });
    res.status(500).json({ error: errorMsg });
  }
};

export const verify2FAHandler = async (req: Request, res: Response) => {
  try {
    const { email, code, device } = req.body;

    console.log(`🔐 2FA Verification request received:`, {
      email: email ? email.toLowerCase() : 'missing',
      codeLength: code ? code.length : 'missing',
      codeValue: code ? '(hidden for security)' : 'missing',
    });

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    await verify2FA(email, code);
    await logAction(req, {
      action: "2FA_VERIFIED_SUCCESS",
      module: "AUTH",
      severity: "info",
      description: email + ' passed 2FA verification',
      userId: req.body.userId,
      device: device,
    });
    res.status(200).json({ message: '2FA verified successfully' });
  } catch (error: any) {
    const errorMsg = error.message || 'Failed to verify 2FA code';
    if (
      errorMsg.includes('Invalid') ||
      errorMsg.includes('expired')
    ) {
      await logAction(req, {
        action: "2FA_VERIFY_ATTEMPT_FAILED",
        module: "AUTH",
        severity: "warning",
        description: errorMsg,
        userId: req.body.userId,
        device: req.body.device,
      });
      return res.status(400).json({ error: 'Invalid or expired 2FA code' });
    }
    await logAction(req, {
      action: "2FA_VERIFY_FAILED",
      module: "AUTH",
      severity: "error",
      description: errorMsg,
      userId: req.body.userId,
      device: req.body.device,
    });
    res.status(500).json({ error: errorMsg });
  }
};

export const sendPasswordResetCodeHandler = async (req: Request, res: Response) => {
  try {
    const { email, device } = req.body;

    console.log(`🔑 Password Reset Code request received:`, {
      email: email ? email.toLowerCase() : 'missing',
    });

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const code = await sendPasswordResetCode(email);
    console.log(`   Generated code: ${code.length} digits`);
    
    await logAction(req, {
      action: "PASSWORD_RESET_CODE_SENT",
      module: "AUTH",
      severity: "info",
      description: `Password reset code sent to ${email}`,
      userId: req.body.userId,
      device: device,
    });
    res.status(200).json({ code });
  } catch (error: any) {
    console.error(`   Error in sendPasswordResetCodeHandler:`, error.message);
    await logAction(req, {
      action: "PASSWORD_RESET_CODE_SEND_FAILED",
      module: "AUTH",
      severity: "error",
      description: error,
      userId: req.body.userId,
      device: req.body.device,
    });
    res.status(500).json({ error: error.message || 'Failed to send password reset code' });
  }
};

export const verifyPasswordResetCodeHandler = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword, device } = req.body;

    console.log(`🔐 Password Reset Verification request received:`, {
      email: email ? email.toLowerCase() : 'missing',
      codeLength: code ? code.length : 'missing',
      codeValue: code ? '(hidden for security)' : 'missing',
    });

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    // Password strength validation
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    await verifyAndResetPassword(email, code, newPassword);
    await logAction(req, {
      action: "PASSWORD_RESET_SUCCESS",
      module: "AUTH",
      severity: "info",
      description: email + ' successfully reset password',
      userId: req.body.userId,
      device: device,
    });
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error: any) {
    const errorMsg = error.message || 'Failed to reset password';
    if (
      errorMsg.includes('Invalid') ||
      errorMsg.includes('expired')
    ) {
      await logAction(req, {
        action: "PASSWORD_RESET_ATTEMPT_FAILED",
        module: "AUTH",
        severity: "warning",
        description: errorMsg,
        userId: req.body.userId,
        device: req.body.device,
      });
      return res.status(400).json({ error: 'Invalid or expired password reset code' });
    }
    await logAction(req, {
      action: "PASSWORD_RESET_FAILED",
      module: "AUTH",
      severity: "error",
      description: errorMsg,
      userId: req.body.userId,
      device: req.body.device,
    });
    res.status(500).json({ error: errorMsg });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const {
      fname,
      lname,
      username,
      email,
      password,
      contactNumber,
      bdate,
      gender,
      type,
      device
    } = req.body;

    if (!fname || !username || !email || !password || !bdate || !gender || !type) {
      const missingFields = [];
      if (!fname) missingFields.push('fname');
      if (!username) missingFields.push('username');
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!bdate) missingFields.push('bdate');
      if (!gender) missingFields.push('gender');
      if (!type) missingFields.push('type');
      
      return res.status(400).json({ 
        error: 'All required fields must be filled',
        missingFields 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const user = await registerUser({
      fname,
      lname,
      username,
      email,
      password,
      contactNumber,
      bdate: new Date(bdate),
      gender,
      type
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    await logAction(req, {
      action: "REGISTER_SUCCESS",
      module: "AUTH",
      severity: "info",
      description: `New user registered: ${email}`,
      userId: user._id?.toString(),
      device: device,
    });
    res.status(201).json(userResponse);
  } catch (error: any) {
    if (error.message === 'Email already exists' || error.message === 'Username already exists') {
      return res.status(400).json({ error: error.message });
    }
    await logAction(req, {
      action: "REGISTER_FAILED",
      module: "AUTH",
      severity: "error",
      description: error,
      device: req.body.device,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const secretKey = process.env.JWT_SECRET || 'default_secret';

    // Verify refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, secretKey);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Refresh token expired, please login again' });
      }
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Find user to ensure they still exist
    const User_model = require('../models/userModel').default;
    const user = await User_model.findById(decoded.id || decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new tokens with proper expiration
    const newAccessToken = jwt.sign(
      { id: user._id.toString(), userId: user._id.toString(), email: user.email },
      secretKey,
      { expiresIn: '1h' } // 1 hour
    );

    const newRefreshToken = jwt.sign(
      { id: user._id.toString(), userId: user._id.toString() },
      secretKey,
      { expiresIn: '14d' } // 14 days
    );

    await logAction(req, {
      action: "ACCESS_TOKEN_REFRESH_SUCCESS",
      module: "AUTH",
      severity: "info",
      description: 'Token refreshed successfully for user:'+ user.email,
      userId: req.body.userId,
    });
    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    await logAction(req, {
      action: "ACCESS_TOKEN_REFRESH_FAILED",
      module: "AUTH",
      severity: "error",
      description: error,
      userId: req.body.userId,
    });
    res.status(500).json({ error: 'Failed to refresh token' });
  }
};

