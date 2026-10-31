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

export type SharedExpenseStatus = 'PENDING' | 'PAID';

export interface SharedExpense {
  id: string;
  expensesId: string;
  userId: string;
  amount: number;
  note: string | null;
  status: SharedExpenseStatus;
  createdOn: string;
  updatedOn: string;
}

export interface Expense {
  id: string;
  walletId: string;
  userId: string;
  amount: number;
  title: string;
  description: string | null;
  sharedExpenses: SharedExpense[];
  createdOn: string;
  updatedOn: string;
}

export interface ExpensesResponse {
  success: boolean;
  expenses?: Expense[];
  message?: string;
}

export interface ExpenseResponse {
  success: boolean;
  expense?: Expense;
  data?: Expense;
  message?: string;
}

export interface SharedExpensePayload {
  userId: string;
  amount: number;
  note?: string | null;
  status?: SharedExpenseStatus;
}

export interface CreateExpensePayload {
  walletId: string;
  amount: number;
  title: string;
  description?: string | null;
  sharedBy?: SharedExpensePayload[];
}

export type UpdateExpensePayload = Partial<Omit<CreateExpensePayload, 'walletId'>>;
