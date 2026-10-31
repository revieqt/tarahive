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

export interface SharedExpenseRequest {
  userId: string;
  amount: number;
  note?: string | null;
  status?: 'PENDING' | 'PAID';
}

export interface CreateExpenseRequest {
  walletId: string;
  amount: number;
  title: string;
  description?: string | null;
  sharedBy?: SharedExpenseRequest[];
}

export interface UpdateExpenseRequest {
  amount?: number;
  title?: string;
  description?: string | null;
  sharedBy?: SharedExpenseRequest[];
}