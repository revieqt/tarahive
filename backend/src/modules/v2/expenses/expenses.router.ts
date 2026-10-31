import { Router } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { rateLimiter } from '../../../middleware/rateLimitMiddleware';
import {
  createExpenseController,
  createWalletController,
  deleteExpenseController,
  deleteWalletController,
  getExpenseController,
  getExpensesByWalletController,
  getUserWalletsController,
  updateExpenseController,
  updateWalletController,
} from './expenses.controller';

const router = Router();

router.get('/wallets', rateLimiter('MODERATE'), authMiddleware, getUserWalletsController);
router.get('/wallet/:id', rateLimiter('MODERATE'), authMiddleware, getExpensesByWalletController);
router.post('/wallet', rateLimiter('MODERATE'), authMiddleware, createWalletController);
router.patch('/wallet/:id', rateLimiter('MODERATE'), authMiddleware, updateWalletController);
router.delete('/wallet/:id', rateLimiter('MODERATE'), authMiddleware, deleteWalletController);
router.post('/', rateLimiter('MODERATE'), authMiddleware, createExpenseController);
router.get('/:id', rateLimiter('MODERATE'), authMiddleware, getExpenseController);
router.patch('/:id', rateLimiter('MODERATE'), authMiddleware, updateExpenseController);
router.delete('/:id', rateLimiter('MODERATE'), authMiddleware, deleteExpenseController);

export default router;