import express from 'express';
import { 
  register, 
  login, 
  sendEmailVerification,
  send2FA,
  verifyEmail,
  verify2FAHandler,
  sendPasswordResetCodeHandler,
  verifyPasswordResetCodeHandler,
  passwordReset,
  changePassword,
  refreshAccessToken
} from './auth.controller';
import { googleAuth } from './auth.google';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/google', googleAuth);
router.post('/register', register);
router.post('/login', login);
router.post('/send-verification', sendEmailVerification);
router.post('/send-2fa', send2FA);
router.post('/send-password-reset-code', sendPasswordResetCodeHandler);
router.post('/verify-email', verifyEmail);
router.post('/verify-2fa', verify2FAHandler);
router.post('/verify-password-reset-code', verifyPasswordResetCodeHandler);
router.post('/reset-password', passwordReset);
router.post('/change-password', authMiddleware, changePassword);
router.post('/refresh', refreshAccessToken);

export default router;
