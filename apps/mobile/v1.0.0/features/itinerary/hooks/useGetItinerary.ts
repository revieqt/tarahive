import { useQuery } from '@tanstack/react-query';
import { getItineraryById } from '@/features/itinerary/services/itineraryService';
import { showError } from '@/shared/services/toast.service';
import { Itinerary } from '../types/itineraryTypes';

export const useGetItinerary = (id: string | null) => {
  const query = useQuery({
    queryKey: ['itinerary', id],
    queryFn: async () => {
      if (!id) {
        return null;
      }

      try {
        const itinerary = await getItineraryById(id);
        return itinerary;
      } catch (error: any) {
        const errorMsg = error?.message || 'Failed to fetch itinerary';
        showError('Fetch Error', errorMsg);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    itinerary: query.data as Itinerary | null | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
