import { useMutation } from '@tanstack/react-query';
import { deleteItinerary } from '@/features/itinerary/services/itineraryService';
import { showError, showSuccess } from '@/shared/services/toast.service';

export const useDeleteItinerary = () => {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      // Validation
      if (!id?.trim()) {
        throw new Error('Itinerary ID is required');
      }

      await deleteItinerary(id);
    },

    onSuccess: () => {
      showSuccess('Success', 'Itinerary deleted successfully');
    },

    onError: (error: any) => {
      const errorMsg = error?.message || 'Failed to delete itinerary';
      showError('Delete Error', errorMsg);
    },
  });

  return {
    delete: mutation.mutate,
    deleteAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};
