import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGetItinerary } from '@/hooks/itinerary/useGetItinerary';
import ItineraryForm from '@/components/itinerary/Form';

export default function ItineraryScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const itineraryId = Array.isArray(id) ? id[0] : id;
	const { itinerary, isLoading, isError } = useGetItinerary(itineraryId ?? null);

	if (isLoading) {
		return (
			<View style={styles.container}>
				<Text>Loading itinerary...</Text>
			</View>
		);
	}

	if (isError || !itinerary) {
		return (
			<View style={styles.container}>
				<Text>Unable to load itinerary.</Text>
			</View>
		);
	}

	return (
		<ItineraryForm
			viewType="owner"
			initialValues={{
				title: itinerary.title,
				type: itinerary.type,
				startDate: new Date(itinerary.startDate),
				endDate: new Date(itinerary.endDate),
				themeColor: itinerary.themeColor,
				content: itinerary.content,
			}}
		/>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
