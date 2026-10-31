import { api } from '@/api/client';
import {
  CreateExpensePayload,
  CreateWalletPayload,
  Expense,
  ExpenseResponse,
  ExpensesResponse,
  WalletExpensesResponse,
  UpdateExpensePayload,
  UpdateWalletPayload,
  Wallet,
  WalletResponse,
  WalletsResponse,
} from '@/types/expensesTypes';

const API_URL = '/v2/expenses';

export const getWallets = async (): Promise<Wallet[]> => {
  const response = await api.get<WalletsResponse>(`${API_URL}/wallets`);
  if (!response.success || !response.wallets) {
    throw new Error(response.message || 'Failed to retrieve wallets');
  }
  return response.wallets;
};

export const createWallet = async (
  payload: CreateWalletPayload,
): Promise<WalletResponse> =>
  api.post<WalletResponse>(`${API_URL}/wallet`, payload);

export const updateWallet = async (
  walletId: string,
  payload: UpdateWalletPayload,
): Promise<WalletResponse> =>
  api.patch<WalletResponse>(
    `${API_URL}/wallet/${encodeURIComponent(walletId)}`,
    payload,
  );

export const deleteWallet = async (walletId: string): Promise<WalletResponse> =>
  api.delete<WalletResponse>(
    `${API_URL}/wallet/${encodeURIComponent(walletId)}`,
  );

export const getExpensesByWallet = async (
  walletId: string,
): Promise<WalletExpensesResponse> => {
  const response = await api.get<ExpensesResponse>(
    `${API_URL}/wallet/${encodeURIComponent(walletId)}`,
  );
  if (!response.success || !response.expenses) {
    throw new Error(response.message || 'Failed to retrieve expenses');
  }
  return {
    success: response.success,
    total: response.total ?? 0,
    expenses: response.expenses,
  };
};

export const getExpense = async (expenseId: string): Promise<Expense> => {
  const response = await api.get<ExpenseResponse>(
    `${API_URL}/${encodeURIComponent(expenseId)}`,
  );
  if (!response.success || !response.expense) {
    throw new Error(response.message || 'Failed to retrieve expense');
  }
  return response.expense;
};

export const createExpense = async (
  payload: CreateExpensePayload,
): Promise<ExpenseResponse> =>
  api.post<ExpenseResponse>(API_URL, payload);

export const updateExpense = async (
  expenseId: string,
  payload: UpdateExpensePayload,
): Promise<ExpenseResponse> =>
  api.patch<ExpenseResponse>(
    `${API_URL}/${encodeURIComponent(expenseId)}`,
    payload,
  );

export const deleteExpense = async (expenseId: string): Promise<ExpenseResponse> =>
  api.delete<ExpenseResponse>(
    `${API_URL}/${encodeURIComponent(expenseId)}`,
  );