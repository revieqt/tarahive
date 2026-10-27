import express from 'express';
import { enableSOSController, disableSOSController, getSOSAdviceController, updateSafetySettingsController } from './sos.controller';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';

const router = express.Router();

router.get('/advice', rateLimiter('MODERATE'), authMiddleware, getSOSAdviceController);
router.patch("/update-settings", rateLimiter('MODERATE'), authMiddleware, updateSafetySettingsController);
router.post('/enable', rateLimiter('MODERATE'), authMiddleware, enableSOSController);
router.post('/disable', rateLimiter('MODERATE'), authMiddleware, disableSOSController);

export default router;