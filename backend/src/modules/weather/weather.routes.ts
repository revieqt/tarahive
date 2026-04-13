import { Router } from 'express';
import { getWeatherController } from './weather.controller';
import { rateLimitMiddleware } from '../../../middleware/rateLimitMiddleware';

const router = Router();

router.get('/', rateLimitMiddleware('moderate'), getWeatherController);

export default router;
