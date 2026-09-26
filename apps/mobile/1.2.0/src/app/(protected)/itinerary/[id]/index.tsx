import React, { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useGetItinerary } from '@/hooks/itinerary/useGetItinerary';
import ItineraryForm from '@/components/itinerary/Form';
import { useRouter } from '@/hooks/shared/useRouter';

export default function ItineraryScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const itineraryId = Array.isArray(id) ? id[0] : id;
	const {
		itinerary,
		isLoading,
		isFetching,
		isError,
		refetch,
	} = useGetItinerary(itineraryId ?? null);
	const retryItinerary = useCallback(() => {
		void refetch();
	}, [refetch]);
	useRouter({
		isLoading: isLoading || isFetching,
		hasError: Boolean(isError || (itinerary === null && !isLoading)),
		onRetry: retryItinerary,
		errorMessage: 'The itinerary could not be fetched. Try again or go back.',
	});

	return (
		<ItineraryForm
			key={itinerary ? 'loaded' : 'pending'}
			viewType="owner"
			initialValues={{
				title: itinerary?.title ?? '',
				type: itinerary?.type ?? 'Solo',
				startDate: itinerary?.startDate ? new Date(itinerary.startDate) : null,
				endDate: itinerary?.endDate ? new Date(itinerary.endDate) : null,
				themeColor: itinerary?.themeColor,
				content: itinerary?.content ?? [],
			}}
		/>
	);
}
