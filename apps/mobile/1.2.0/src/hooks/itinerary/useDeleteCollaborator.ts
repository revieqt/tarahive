import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showError, showSuccess } from '@/services/toast.service';
import { deleteItineraryCollaborator } from '@/services/itineraryService';

export const useDeleteCollaborator = (itineraryId: string | undefined) => {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: deleteItineraryCollaborator,
		onSuccess: async (response) => {
			if (!response.success) throw new Error(response.message || 'Could not remove collaborator');
			await queryClient.invalidateQueries({ queryKey: ['itinerary-collaborators', itineraryId] });
			showSuccess('Success', response.message || 'Collaborator removed');
		},
		onError: (error: Error) => showError('Collaborator Error', error.message),
	});

	return {
		deleteCollaborator: mutation.mutate,
		isPending: mutation.isPending,
	};
};
