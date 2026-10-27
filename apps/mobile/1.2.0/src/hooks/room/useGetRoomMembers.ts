import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { getRoomMembers } from '@/services/roomService';
import { showError } from '@/services/toast.service';

export const useGetRoomMembers = () => {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const roomId = Array.isArray(id) ? id[0] : id;

  const query = useQuery({
    queryKey: ['room', roomId, 'members'],
    queryFn: async () => {
      if (!roomId) throw new Error('Room ID is missing');
      try {
        return await getRoomMembers(roomId);
      } catch (error) {
        const fetchError = error instanceof Error
          ? error
          : new Error('Failed to fetch room members');
        showError('Fetch Error', fetchError.message);
        throw error;
      }
    },
    enabled: Boolean(roomId),
    staleTime: 5 * 60 * 1000,
  });

  return {
    members: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
