import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ItineraryScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return (
		<View style={styles.container}>
			<Text>Itinerary ID: {id}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
