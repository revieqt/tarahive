import express from 'express';
import { enableSOSController, disableSOSController } from './sos.controller';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';

const router = express.Router();

router.post('/enable', rateLimiter('MODERATE'), authMiddleware, enableSOSController);
router.post('/disable', rateLimiter('MODERATE'), authMiddleware, disableSOSController);

export default router;