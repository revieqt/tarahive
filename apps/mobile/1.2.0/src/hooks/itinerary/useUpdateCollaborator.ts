import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showError, showSuccess } from '@/services/toast.service';
import { updateItineraryCollaborator } from '@/services/itineraryService';
import { UpdateItineraryCollaboratorPayload } from '@/types/itineraryTypes';

export const useUpdateCollaborator = (itineraryId: string | undefined) => {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: updateItineraryCollaborator,
		onSuccess: async (response) => {
			if (!response.success) throw new Error(response.message || 'Could not update collaborator');
			await queryClient.invalidateQueries({ queryKey: ['itinerary-collaborators', itineraryId] });
			showSuccess('Success', response.message || 'Collaborator updated');
		},
		onError: (error: Error) => showError('Collaborator Error', error.message),
	});

	return {
		updateCollaborator: (
			payload: UpdateItineraryCollaboratorPayload,
			onSuccess?: () => void
		) => mutation.mutate(payload, { onSuccess: () => onSuccess?.() }),
		isPending: mutation.isPending,
	};
};
