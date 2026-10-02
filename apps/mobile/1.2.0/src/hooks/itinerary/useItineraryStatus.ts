import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showError, showSuccess } from '@/services/toast.service';
import { updateItineraryStatus } from '@/services/itineraryService';
import { ItineraryStatus } from '@/types/itineraryTypes';

export const useItineraryStatus = (
  itineraryId: string | undefined,
  currentStatus: ItineraryStatus | undefined
) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (status: ItineraryStatus) => {
      if (!itineraryId) {
        throw new Error('Itinerary ID is required');
      }
      if (!Object.values(ItineraryStatus).includes(status)) {
        throw new Error('Invalid itinerary status');
      }

      const response = await updateItineraryStatus({ itineraryId, status });
      if (!response.success) {
        throw new Error(response.message || 'Failed to update itinerary status');
      }
      return response;
    },
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['itinerary', itineraryId] }),
        queryClient.invalidateQueries({ queryKey: ['user-itineraries'] }),
      ]);
      showSuccess('Success', response.message || 'Itinerary status updated successfully');
    },
    onError: (error: Error) => {
      showError('Update Error', error.message || 'Failed to update itinerary status');
    },
  });

  const updateStatus = (status: ItineraryStatus) => {
    if (!itineraryId || status === currentStatus || mutation.isPending) return;
    mutation.mutate(status);
  };

  return {
    updateStatus,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};