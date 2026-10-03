import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showError, showSuccess } from '@/services/toast.service';
import { addItineraryCollaborator } from '@/services/itineraryService';
import { AddItineraryCollaboratorPayload } from '@/types/itineraryTypes';

export const useAddCollaborator = (itineraryId: string | undefined) => {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: addItineraryCollaborator,
		onSuccess: async (response) => {
			if (!response.success) throw new Error(response.message || 'Could not add collaborator');
			await queryClient.invalidateQueries({ queryKey: ['itinerary-collaborators', itineraryId] });
			showSuccess('Success', response.message || 'Collaborator added');
		},
		onError: (error: Error) => showError('Collaborator Error', error.message),
	});

	return {
		addCollaborator: (
			payload: AddItineraryCollaboratorPayload,
			onSuccess?: () => void
		) => mutation.mutate(payload, { onSuccess: () => onSuccess?.() }),
		isPending: mutation.isPending,
	};
};
