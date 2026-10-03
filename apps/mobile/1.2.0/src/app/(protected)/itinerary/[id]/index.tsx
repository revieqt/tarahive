import React, { useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useGetItinerary } from '@/hooks/itinerary/useGetItinerary';
import ItineraryForm from '@/components/itinerary/Form';
import { useRouter } from '@/hooks/shared/useRouter';
import { CreateItineraryForm } from '@/types/itineraryTypes';

export default function ItineraryScreen() {
	const queryClient = useQueryClient();
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
	const repeatItinerary = useCallback(() => {
		if (!itinerary) return;

		const draft: CreateItineraryForm = {
			title: itinerary.title,
			type: itinerary.type,
			startDate: new Date(itinerary.startDate),
			endDate: new Date(itinerary.endDate),
			themeColor: itinerary.themeColor ?? '#FF6B6B',
			content: itinerary.content,
		};

		queryClient.setQueryData(['itinerary-repeat-draft'], draft);
		router.replace('/itinerary/create');
	}, [itinerary, queryClient]);
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
			itineraryId={itineraryId}
			ownerUsername={itinerary?.user?.username}
			initialItinerary={itinerary ?? undefined}
			onRepeatItinerary={repeatItinerary}
			initialValues={{
				title: itinerary?.title ?? '',
				type: itinerary?.type ?? 'Solo',
				startDate: itinerary?.startDate ? new Date(itinerary.startDate) : null,
				endDate: itinerary?.endDate ? new Date(itinerary.endDate) : null,
				privacy: itinerary?.privacy ?? 'private',
				generalPermissions: itinerary?.generalPermissions ?? { allowSharing: true, allowCopying: true },
				themeColor: itinerary?.themeColor,
				content: itinerary?.content ?? [],
			}}
		/>
	);
}
