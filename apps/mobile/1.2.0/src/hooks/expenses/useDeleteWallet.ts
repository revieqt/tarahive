import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteWallet } from '@/services/expensesService';
import { showError, showSuccess } from '@/services/toast.service';
import { walletsQueryKey } from './useGetWallets';

export const useDeleteWallet = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteWallet,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: walletsQueryKey });
      showSuccess('Success', response.message || 'Wallet deleted successfully');
    },
    onError: (error: Error) => showError('Delete Error', error.message),
  });

  return {
    deleteWallet: mutation.mutate,
    isPending: mutation.isPending,
  };
};