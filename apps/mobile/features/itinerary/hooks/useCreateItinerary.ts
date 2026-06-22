import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createItinerary } from '@/features/itinerary/services/itineraryService';
import { showError, showSuccess } from '@/shared/services/toast.service';
import { CreateItineraryRequest, Itinerary } from '../types/itineraryTypes';

export const useCreateItinerary = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateItineraryRequest) => {
      // Validation
      if (!data.title?.trim()) {
        throw new Error('Title is required');
      }

      if (!data.type?.trim()) {
        throw new Error('Type is required');
      }

      if (!data.startDate) {
        throw new Error('Start date is required');
      }

      if (!data.endDate) {
        throw new Error('End date is required');
      }

      if (data.startDate > data.endDate) {
        throw new Error('Start date must be before end date');
      }

      if (!data.locations || data.locations.length === 0) {
        throw new Error('At least one location is required');
      }

      return await createItinerary(data);
    },

    onSuccess: (data: Itinerary) => {
      showSuccess('Success', `Itinerary "${data.title}" created successfully`);
      // Invalidate all user itineraries queries (all status filters)
      queryClient.invalidateQueries({ queryKey: ['user-itineraries'] });
    },

    onError: (error: any) => {
      const errorMsg = error?.message || 'Failed to create itinerary';
      showError('Create Error', errorMsg);
    },
  });

  return {
    create: mutation.mutate,
    createAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
  };
};
