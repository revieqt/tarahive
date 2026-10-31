import { api } from '@/api/client';
import {
  CreateWalletPayload,
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