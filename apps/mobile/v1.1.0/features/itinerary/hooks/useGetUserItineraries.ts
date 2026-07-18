import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllUserItineraries } from '@/features/itinerary/services/itineraryService';
import { showError } from '@/shared/services/toast.service';
import { Itinerary } from '../types/itineraryTypes';

interface GetUserItinerariesOptions {
  currentMonth?: boolean;
  date?: string;
}

const isItineraryInCurrentMonth = (itinerary: Itinerary, now: Date) => {
  const start = new Date(itinerary.startDate);
  const end = new Date(itinerary.endDate);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return start <= monthEnd && end >= monthStart;
};

const isItineraryOnDate = (itinerary: Itinerary, date: string) => {
  const target = new Date(date);
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 0, 0, 0, 0);
  const targetEnd = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59, 59, 999);
  const start = new Date(itinerary.startDate);
  const end = new Date(itinerary.endDate);

  return start <= targetEnd && end >= targetStart;
};

const filterCachedActiveItineraries = (
  itineraries: Itinerary[] | undefined,
  options?: GetUserItinerariesOptions
) => {
  if (!itineraries?.length) {
    return null;
  }

  if (options?.currentMonth) {
    return itineraries.filter((itinerary) => itinerary.status === 'active' && isItineraryInCurrentMonth(itinerary, new Date()));
  }

  if (options?.date) {
    return itineraries.filter(
      (itinerary) => itinerary.status === 'active' && isItineraryOnDate(itinerary, options.date as string)
    );
  }

  return itineraries;
};

export const useGetUserItineraries = (
  status: string = 'active',
  options?: GetUserItinerariesOptions
) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: [
      'user-itineraries',
      status,
      options?.currentMonth ? 'currentMonth' : 'all',
      options?.date ?? 'all',
    ],
    queryFn: async () => {
      try {
        const activeCache = queryClient.getQueryData<Itinerary[]>(['user-itineraries', 'active']);
        const cached = filterCachedActiveItineraries(activeCache, options);

        if (cached && cached.length > 0) {
          return cached;
        }

        return await getAllUserItineraries(status, options);
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
