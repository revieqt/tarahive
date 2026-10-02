import express from 'express';
import {
  createItinerary,
  updateItinerary,
  getItinerary,
  getAllUserItineraries,
} from './itinerary.controller';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';

const router = express.Router();
// Get all user itineraries
router.get('/', rateLimiter('MODERATE'), authMiddleware, getAllUserItineraries);

// Create a new itinerary
router.post('/',rateLimiter('MODERATE'), authMiddleware, createItinerary);
router.patch('/', rateLimiter('MODERATE'), authMiddleware, updateItinerary);

// Get a specific itinerary by ID
router.get('/:id', rateLimiter('MODERATE'), authMiddleware, getItinerary);

export default router;