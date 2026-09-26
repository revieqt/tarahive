import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TText, TView, TIcon } from '@/components/ui/Themed';
import WeatherDisplay from '@/components/common/WeatherDisplay';
import { usePlaceWeather } from '@/hooks/shared/useWeather';
import { LinearGradient } from 'expo-linear-gradient';
import BackButton from '@/components/common/BackButton';
import { useThemeColor } from '@/hooks/shared/useThemeColor';

export default function PlacesScreen() {
	const { id, address: addressParam, latitude, longitude, locationName, locationID } =
		useLocalSearchParams<{
			id?: string;
			address?: string;
			latitude?: string;
			longitude?: string;
			locationName?: string;
			locationID?: string;
		}>();
	const address = addressParam
		? JSON.parse(Array.isArray(addressParam) ? addressParam[0] : addressParam)
		: undefined;
	const city = address?.city || locationName || '';
	const latitudeValue = latitude ? Number(latitude) : undefined;
	const longitudeValue = longitude ? Number(longitude) : undefined;
	const { data: weather, isLoading: weatherLoading } = usePlaceWeather(
		latitudeValue,
		longitudeValue,
		city,
	);
	const accentColor = useThemeColor({}, 'accent');

	return (
		<View style={{flex: 1, backgroundColor: 'blue'}}>
			<BackButton type='floating' color='white' style={styles.back}/>

			<LinearGradient
				colors={[ 'transparent','#000']}
				style={styles.footer}
			>
				<TText style={styles.name}>{locationName}</TText>
				<TText style={styles.address}>
					{address.neighborhood ? address.neighborhood + ', ' : null}
					{address.district ? address.district + ', ' : null}
					{address.city ? address.city + ' ' : null}
					{address.postal_code ? address.postal_code + ', ' : ', '}
					{address.region ? address.region + ', ' : null}
					{address.country ? address.country : null}
				</TText>

				<ScrollView 
					horizontal 
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.tabsContainer}
				>
					<TouchableOpacity style={[styles.tabs, {backgroundColor: accentColor}]}>
						<TIcon name='directions' size={15} color='white'/>
						<TText style={styles.tabsText}>Directions</TText>
					</TouchableOpacity>

					<TouchableOpacity style={styles.tabs}>
						<TIcon name='magnify' size={15} color='white'/>
						<TText style={styles.tabsText}>Search</TText>
					</TouchableOpacity>
				</ScrollView>

				<WeatherDisplay
					heatValue={weather?.temperature ?? undefined}
					rainValue={weather?.precipitation ?? undefined}
					humidValue={weather?.humidity ?? undefined}
					windValue={weather?.windSpeed ?? undefined}
					loading={weatherLoading}
					textColor='white'
					backgroundColor='#0004'
				/>
			</LinearGradient>
		</View>
	);
}

const styles = StyleSheet.create({
	back:{
		backgroundColor: '#0007',
		borderRadius: 20
	},
	footer:{
		paddingHorizontal: '3%',
		paddingTop: 100,
		paddingBottom: 20,
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0
	},
	name:{
		color: '#fff',
		fontSize: 15,
		fontWeight: 700
	},
	address:{
		color: '#fff9'
	},
	tabsContainer:{
		gap: 5,
		paddingVertical: 10
	},
	tabs:{
		backgroundColor: '#0007',
		flexDirection: 'row',
		gap: 5,
		paddingVertical: 7,
		paddingHorizontal: 10,
		borderRadius: 20
	},
	tabsText:{
		color: 'white'
	}
});
