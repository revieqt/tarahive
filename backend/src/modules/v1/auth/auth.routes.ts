import { Router } from 'express';
import { register, sendEmailVerification, verifyEmail } from './auth.controller';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';

const router = Router();

router.post('/register', rateLimiter('HIGH'), register);
router.post('/send-email-verification', rateLimiter('SENSITIVE'), sendEmailVerification);
router.post('/verify-email', rateLimiter('SENSITIVE'), verifyEmail);

export default router;