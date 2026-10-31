import { Response } from 'express';
import { AuthRequest } from '../auth/auth.types';
import {
  createExpense,
  createWallet,
  deleteExpense,
  deleteWallet,
  getExpenseById,
  getExpensesByWallet,
  getUserWallets,
  updateExpense,
  updateWallet,
  ExpenseForbiddenError,
  ExpenseNotFoundError,
  ExpenseValidationError,
  WalletForbiddenError,
  WalletNotFoundError,
  WalletValidationError,
} from './expenses.service';
import {
  CreateExpenseRequest,
  CreateWalletRequest,
  UpdateExpenseRequest,
  UpdateWalletRequest,
} from './expenses.types';

const errorStatus = (error: unknown): number => {
  if (error instanceof WalletNotFoundError) return 404;
  if (error instanceof WalletForbiddenError) return 403;
  if (error instanceof WalletValidationError) return 400;
  if (error instanceof ExpenseNotFoundError) return 404;
  if (error instanceof ExpenseForbiddenError) return 403;
  if (error instanceof ExpenseValidationError) return 400;
  return 500;
};

export const createExpenseController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    const expense = await createExpense(userId, req.body as CreateExpenseRequest);
    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create expense';
    res.status(errorStatus(error)).json({ success: false, message });
  }
};

export const getExpensesByWalletController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    if (typeof req.params.id !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid wallet id' });
      return;
    }

    const result = await getExpensesByWallet(req.params.id, userId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch expenses';
    res.status(errorStatus(error)).json({ success: false, message });
  }
};

export const getExpenseController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    if (typeof req.params.id !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid expense id' });
      return;
    }

    const expense = await getExpenseById(req.params.id, userId);
    res.status(200).json({ success: true, expense });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch expense';
    res.status(errorStatus(error)).json({ success: false, message });
  }
};

export const updateExpenseController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    if (typeof req.params.id !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid expense id' });
      return;
    }

    const expense = await updateExpense(
      req.params.id,
      userId,
      req.body as UpdateExpenseRequest,
    );
    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update expense';
    res.status(errorStatus(error)).json({ success: false, message });
  }
};

export const deleteExpenseController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    if (typeof req.params.id !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid expense id' });
      return;
    }

    await deleteExpense(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete expense';
    res.status(errorStatus(error)).json({ success: false, message });
  }
};

export const getUserWalletsController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    const wallets = await getUserWallets(userId);
    res.status(200).json({
      success: true,
      wallets,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch wallets';
    res.status(500).json({ success: false, message });
  }
};

export const createWalletController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    const wallet = await createWallet(userId, req.body as CreateWalletRequest);
    res.status(201).json({
      success: true,
      message: 'Wallet created successfully',
      data: wallet,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create wallet';
    res.status(errorStatus(error)).json({ success: false, message });
  }
};

export const updateWalletController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    if (typeof req.params.id !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid wallet id' });
      return;
    }

    const wallet = await updateWallet(
      req.params.id,
      userId,
      req.body as UpdateWalletRequest,
    );
    res.status(200).json({
      success: true,
      message: 'Wallet updated successfully',
      data: wallet,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update wallet';
    res.status(errorStatus(error)).json({ success: false, message });
  }
};

export const deleteWalletController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    if (typeof req.params.id !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid wallet id' });
      return;
    }

    await deleteWallet(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: 'Wallet deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete wallet';
    res.status(errorStatus(error)).json({ success: false, message });
  }
};