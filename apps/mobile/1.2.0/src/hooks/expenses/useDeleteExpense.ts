import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteExpense } from '@/services/expensesService';
import { showError, showSuccess } from '@/services/toast.service';
import { expenseQueryKey } from './useGetExpense';
import { expensesByWalletQueryKey } from './useGetExpenses';

export const useDeleteExpense = (walletId?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: expensesByWalletQueryKey(walletId) });
      queryClient.removeQueries({ queryKey: expenseQueryKey(mutation.variables) });
      showSuccess('Success', response.message || 'Expense deleted successfully');
    },
    onError: (error: Error) => showError('Delete Error', error.message),
  });

  return { deleteExpense: mutation.mutate, isPending: mutation.isPending };
};
