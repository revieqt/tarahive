export interface CreateWalletRequest {
  roomId?: string;
  amountLimit?: number;
  name: string;
  description?: string | null;
  color?: string;
}

export interface UpdateWalletRequest {
  amountLimit?: number;
  name?: string;
  description?: string | null;
  color?: string;
}