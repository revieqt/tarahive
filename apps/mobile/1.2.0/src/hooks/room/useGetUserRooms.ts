import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { getUserRooms } from '@/services/roomService';
import { showError } from '@/services/toast.service';

export const useGetUserRooms = () => {
  const query = useQuery({
    queryKey: ['user-rooms'],
    queryFn: async () => {
      try {
        return await getUserRooms();
      } catch (error) {
        const fetchError = error instanceof Error ? error : new Error('Failed to fetch rooms');
        showError('Fetch Error', fetchError.message);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const openRoom = (roomId: string) => router.push(`/room/${roomId}`);
  const navigateToCreateRoom = () => router.push('/room/create');
  const navigateToSearchRooms = () => router.push('/room/search');
  const navigateToJoinRoom = () => router.push('/room/join');

  return {
    rooms: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    openRoom,
    navigateToCreateRoom,
    navigateToSearchRooms,
    navigateToJoinRoom,
  };
};
