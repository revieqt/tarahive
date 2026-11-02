import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { getCountryPhoneCodesController } from './country.controller';

const router = Router();

router.get('/phone-codes', authMiddleware, getCountryPhoneCodesController);

export default router;