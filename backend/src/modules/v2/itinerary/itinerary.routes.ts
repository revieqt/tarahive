import express from 'express';
import {
  createItinerary,
  getItinerary,
  getAllUserItineraries,
  deleteItinerary,
} from './itinerary.controller';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';

const router = express.Router();
// Get all user itineraries
router.get('/', rateLimiter('MODERATE'), authMiddleware, getAllUserItineraries);

// Create a new itinerary
router.post('/create',rateLimiter('MODERATE'), authMiddleware, createItinerary);

// Get a specific itinerary by ID
router.get('/:id', rateLimiter('MODERATE'), authMiddleware, getItinerary);

// Delete an itinerary
router.delete('/delete/:itineraryID', rateLimiter('MODERATE'), authMiddleware, deleteItinerary);

export default router;