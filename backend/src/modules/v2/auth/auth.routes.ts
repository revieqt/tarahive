import { Router } from 'express';
import {
  logout,
  logoutAll,
  refreshAuthToken,
  useEmailAuth,
  verifyEmail,
} from './auth.controller';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';
import { authMiddleware } from '../../../middleware/authMiddleware';

const router = Router();

router.post('/email/request', rateLimiter('SENSITIVE'), useEmailAuth);
router.post('/email/verify', rateLimiter('SENSITIVE'), verifyEmail);
router.post('/refresh', rateLimiter('SENSITIVE'), refreshAuthToken);
router.post('/logout', rateLimiter('MODERATE'), logout);
router.post('/logout-all', rateLimiter('MODERATE'), authMiddleware, logoutAll);

export default router;