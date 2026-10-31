import { useQuery } from '@tanstack/react-query';
import { getWallets } from '@/services/expensesService';
import { showError } from '@/services/toast.service';

export const walletsQueryKey = ['user-wallets'];

export const useGetWallets = () => {
  const query = useQuery({
    queryKey: walletsQueryKey,
    queryFn: async () => {
      try {
        return await getWallets();
      } catch (error) {
        const fetchError = error instanceof Error ? error : new Error('Failed to fetch wallets');
        showError('Wallet Error', fetchError.message);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    wallets: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};