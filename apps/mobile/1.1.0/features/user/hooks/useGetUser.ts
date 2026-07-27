import { useQuery } from '@tanstack/react-query';
import { fetchUserByIdOrUsername } from '../services/userService';
import { showError } from '@/shared/services/toast.service';
import { useEffect } from 'react';
import { User } from '@/features/auth/context/SessionContext';

/**
 * Hook to fetch a user by ID or username
 * Handles error display via toast and provides loading/error states
 */
export const useGetUser = (idOrUsername: string | null) => {
  const query = useQuery({
    queryKey: ['user', idOrUsername],
    queryFn: async () => {
      if (!idOrUsername) {
        throw new Error('No user identifier provided');
      }
      return await fetchUserByIdOrUsername(idOrUsername);
    },
    enabled: !!idOrUsername,
    retry: 1,
  });

  // Handle errors separately using useEffect
  useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage = query.error instanceof Error ? query.error.message : 'Failed to fetch user';
      showError('Error', errorMessage);
    }
  }, [query.isError, query.error]);

  return {
    user: query.data as User | undefined,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    refetch: query.refetch,
  };
};
