import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';
import {
  createWalletController,
  deleteWalletController,
  getUserWalletsController,
  updateWalletController,
} from './expenses.controller';

const router = Router();

router.get('/wallets', rateLimiter('MODERATE'), authMiddleware, getUserWalletsController);
router.post('/wallet', rateLimiter('MODERATE'), authMiddleware, createWalletController);
router.patch('/wallet/:id', rateLimiter('MODERATE'), authMiddleware, updateWalletController);
router.delete('/wallet/:id', rateLimiter('MODERATE'), authMiddleware, deleteWalletController);

export default router;