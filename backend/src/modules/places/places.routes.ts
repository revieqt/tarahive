import express from 'express';
import {
  reverseGeocode,
  geocode,
  geocodeDebug,
} from './places.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = express.Router();

router.get('/reverse-geocode', authMiddleware, reverseGeocode);
router.post('/geocode', authMiddleware, geocode);

export default router;
