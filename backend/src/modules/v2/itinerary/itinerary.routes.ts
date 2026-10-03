import express from 'express';
import {
  createItinerary,
  updateItinerary,
  updateItineraryStatus,
  getItineraryCollaborators,
  createItineraryCollaborator,
  updateItineraryCollaborator,
  deleteItineraryCollaborator,
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
router.patch('/status', rateLimiter('MODERATE'), authMiddleware, updateItineraryStatus);
router.get('/collaborator/:id', rateLimiter('MODERATE'), authMiddleware, getItineraryCollaborators);
router.post('/collaborator', rateLimiter('MODERATE'), authMiddleware, createItineraryCollaborator);
router.patch('/collaborator', rateLimiter('MODERATE'), authMiddleware, updateItineraryCollaborator);
router.delete('/collaborator', rateLimiter('MODERATE'), authMiddleware, deleteItineraryCollaborator);

// Get a specific itinerary by ID
router.get('/:id', rateLimiter('MODERATE'), authMiddleware, getItinerary);

export default router;