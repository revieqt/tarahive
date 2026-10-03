import { useQuery } from '@tanstack/react-query';
import { getItineraryCollaborators } from '@/services/itineraryService';

export const useGetCollaborators = (itineraryId: string | undefined) =>
	useQuery({
		queryKey: ['itinerary-collaborators', itineraryId],
		queryFn: () => getItineraryCollaborators(itineraryId!),
		enabled: Boolean(itineraryId),
	});
