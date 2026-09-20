import { Router } from 'express';
import { useEmailAuth, verifyEmail } from './auth.controller';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';
import { authMiddleware } from '../../../middleware/authMiddleware';

const router = Router();

router.post('/email/request', rateLimiter('SENSITIVE'), useEmailAuth);
router.post('/email/verify', rateLimiter('SENSITIVE'), verifyEmail);

export default router;