import { Router } from 'express';
import { register, sendEmailVerification } from './auth.controller';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';

const router = Router();

router.post('/register', rateLimiter('HIGH'), register);
router.post('/send-email-verification', rateLimiter('SENSITIVE'), sendEmailVerification);

export default router;