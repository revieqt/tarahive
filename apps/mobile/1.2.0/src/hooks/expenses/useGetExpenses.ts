import { useQuery } from '@tanstack/react-query';
import { getExpensesByWallet } from '@/services/expensesService';
import { showError } from '@/services/toast.service';

export const expensesByWalletQueryKey = (walletId?: string) =>
  ['wallet-expenses', walletId] as const;

export const useGetExpenses = (walletId?: string) => {
  const query = useQuery({
    queryKey: expensesByWalletQueryKey(walletId),
    queryFn: async () => {
      if (!walletId) return [];
      try {
        return await getExpensesByWallet(walletId);
      } catch (error) {
        const fetchError = error instanceof Error ? error : new Error('Failed to fetch expenses');
        showError('Expense Error', fetchError.message);
        throw error;
      }
    },
    enabled: Boolean(walletId),
    staleTime: 60 * 1000,
  });

  return {
    expenses: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
