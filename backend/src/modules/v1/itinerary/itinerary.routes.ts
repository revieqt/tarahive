import express from 'express';
import {
  createItinerary,
  getItinerary,
  getAllUserItineraries,
} from './itinerary.controller';
import { authMiddleware } from '../../../middleware/authMiddleware';

const router = express.Router();
// Get all user itineraries
router.get('/', authMiddleware, getAllUserItineraries);

// Create a new itinerary
router.post('/create', authMiddleware, createItinerary);

// Get a specific itinerary by ID
router.get('/:id', authMiddleware, getItinerary);

export default router;