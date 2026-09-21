import { Router } from 'express';
import { getWeatherController } from './weather.controller';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';

const router = Router();

router.get('/', rateLimiter('MODERATE'), getWeatherController);

export default router;
