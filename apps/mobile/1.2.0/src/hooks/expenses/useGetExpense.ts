import { useQuery } from '@tanstack/react-query';
import { getExpense } from '@/services/expensesService';
import { showError } from '@/services/toast.service';

export const expenseQueryKey = (expenseId?: string) =>
  ['expense', expenseId] as const;

export const useGetExpense = (expenseId?: string) => {
  const query = useQuery({
    queryKey: expenseQueryKey(expenseId),
    queryFn: async () => {
      if (!expenseId) return null;
      try {
        return await getExpense(expenseId);
      } catch (error) {
        const fetchError = error instanceof Error ? error : new Error('Failed to fetch expense');
        showError('Expense Error', fetchError.message);
        throw error;
      }
    },
    enabled: Boolean(expenseId),
    staleTime: 60 * 1000,
  });

  return {
    expense: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
