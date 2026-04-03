import { Router } from 'express';
import { UnifiedAIController, AIChatController } from './unified.controller';
import { createAIItinerary } from './itinerary.controller';
import { AIClearController } from './clear.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

// ============= NEW UNIFIED ENDPOINTS =============

/**
 * POST /api/ai/
 * Unified endpoint for chat and itinerary generation
 *
 * Request:
 * - Header: Authorization: Bearer <accessToken>
 * - Body: { message }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   type: 'chat' | 'itinerary',
 *   json?: any
 * }
 */
router.post('/', authMiddleware, UnifiedAIController.handleAIRequest);

/**
 * POST /api/ai/clear
 * Clear all conversation history for the authenticated user
 *
 * Request:
 * - Header: Authorization: Bearer <accessToken>
 * - Body: empty or {}
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
router.post('/clear', authMiddleware, AIClearController.clearContext);

// ============= OLD ENDPOINTS (DEPRECATED - KEPT FOR REFERENCE) =============
// router.post('/chat', authMiddleware, AIChatController.chat);
// router.post('/itinerary', authMiddleware, createAIItinerary);

export default router;