import { useQuery } from '@tanstack/react-query';
import { getWallets } from '@/services/expensesService';
import { showError } from '@/services/toast.service';

export const walletsQueryKey = ['user-wallets'];

export const useGetWallets = (roomId?: string) => {
  const query = useQuery({
    queryKey: [...walletsQueryKey, roomId ?? 'personal'],
    queryFn: async () => {
      try {
        const wallets = await getWallets();
        return roomId
          ? wallets.filter((wallet) => wallet.roomId === roomId)
          : wallets.filter((wallet) => wallet.roomId === null);
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