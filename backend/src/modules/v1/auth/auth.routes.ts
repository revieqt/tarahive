import { Router } from 'express';
import { register, sendEmailVerification, verifyEmail, login, changePassword } from './auth.controller';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';
import { authMiddleware } from '../../../middleware/authMiddleware';

const router = Router();

router.post('/register', rateLimiter('HIGH'), register);
router.post('/send-verification', rateLimiter('SENSITIVE'), sendEmailVerification);
router.post('/verify', rateLimiter('SENSITIVE'), verifyEmail);
router.post('/login', rateLimiter('HIGH'), login);
router.post('/change-password', rateLimiter('HIGH'), authMiddleware, changePassword);

export default router;