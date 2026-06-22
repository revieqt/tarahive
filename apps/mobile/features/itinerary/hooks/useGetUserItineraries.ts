import { useQuery } from '@tanstack/react-query';
import { getAllUserItineraries } from '@/features/itinerary/services/itineraryService';
import { showError } from '@/shared/services/toast.service';
import { Itinerary } from '../types/itineraryTypes';

export const useGetUserItineraries = (status: string = 'active') => {
  const query = useQuery({
    queryKey: ['user-itineraries', status],
    queryFn: async () => {
      try {
        return await getAllUserItineraries(status);
      } catch (error: any) {
        const errorMsg = error?.message || 'Failed to fetch itineraries';
        showError('Fetch Error', errorMsg);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    itineraries: query.data as Itinerary[] | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
