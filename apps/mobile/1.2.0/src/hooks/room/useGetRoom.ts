import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { getRoomById } from '@/services/roomService';
import { showError } from '@/services/toast.service';
import { Room } from '@/types/roomTypes';

export const useGetRoom = () => {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const roomId = Array.isArray(id) ? id[0] : id;
  const [selectedTab, setSelectedTab] = useState<'feed' | 'members'>('feed');

  const query = useQuery({
    queryKey: ['room', roomId],
    queryFn: async () => {
      if (!roomId) return null;

      try {
        return await getRoomById(roomId);
      } catch (error) {
        const fetchError = error instanceof Error ? error : new Error('Failed to fetch room');
        showError('Fetch Error', fetchError.message);
        throw error;
      }
    },
    enabled: !!roomId,
    staleTime: 5 * 60 * 1000,
  });

  const navigateToChat = () => {
    if (roomId) router.push({ pathname: '/room/[id]/chat', params: { id: roomId } });
  };

  const navigateToMembers = () => {
    if (roomId) router.push({ pathname: '/room/[id]/members', params: { id: roomId } });
  };

  const navigateToUpdate = () => {
    if (roomId) router.push({ pathname: '/room/[id]/update', params: { id: roomId } });
  };

  return {
    room: query.data as Room | null | undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    selectedTab,
    setSelectedTab,
    navigateToChat,
    navigateToMembers,
    navigateToUpdate,
  };
};
