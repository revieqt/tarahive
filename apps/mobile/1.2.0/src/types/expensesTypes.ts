export interface Wallet {
  id: string;
  userId: string;
  roomId: string | null;
  amountLimit: number;
  name: string;
  description: string | null;
  color: string;
  createdOn: string;
  updatedOn: string;
}

export interface WalletsResponse {
  success: boolean;
  wallets?: Wallet[];
  message?: string;
}

export interface WalletResponse {
  success: boolean;
  message: string;
  data?: Wallet;
}

export interface CreateWalletPayload {
  roomId?: string;
  amountLimit?: number;
  name: string;
  description?: string | null;
  color?: string;
}

export type UpdateWalletPayload = Partial<Omit<CreateWalletPayload, 'roomId'>>;
