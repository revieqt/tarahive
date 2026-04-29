import { Router } from 'express';
import { register } from './auth.controller';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';

const router = Router();

router.post('/register', rateLimiter('HIGH'), register);

export default router;