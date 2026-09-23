import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createItinerary } from '@/services/itineraryService';
import { showError, showSuccess } from '@/services/toast.service';
import { CreateItineraryForm, CreateItineraryRequest, CreateItineraryResponse } from '@/types/itineraryTypes';
import { router } from 'expo-router';

export const useCreateItinerary = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateItineraryForm) => {
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

      if (!data.themeColor?.trim()) {
        throw new Error('Theme color is required');
      }

      const request: CreateItineraryRequest = {
        ...data,
        startDate: data.startDate,
        endDate: data.endDate,
      };

      return await createItinerary(request);
    },

    onSuccess: (data: CreateItineraryResponse) => {
      showSuccess('Success', data.message);
      // Invalidate all user itineraries queries (all status filters)
      queryClient.invalidateQueries({ queryKey: ['user-itineraries'] });
      router.replace(`/itinerary/${data.itineraryID}`);
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
