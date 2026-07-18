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
  const cacheKey = ['user-itineraries', status] as const;

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      try {
        const cachedStatusData = queryClient.getQueryData<Itinerary[]>(cacheKey);

        if (cachedStatusData !== undefined) {
          return cachedStatusData;
        }

        const fetchOptions = status === 'active' && options?.date
          ? { currentMonth: true }
          : options;

        const fetchedData = await getAllUserItineraries(status, fetchOptions);
        queryClient.setQueryData(cacheKey, fetchedData);
        return fetchedData;
      } catch (error: any) {
        const errorMsg = error?.message || 'Failed to fetch itineraries';
        showError('Fetch Error', errorMsg);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const itineraries = status === 'active'
    ? filterCachedActiveItineraries(query.data, options) ?? []
    : query.data ?? [];

  return {
    itineraries: itineraries as Itinerary[] | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
