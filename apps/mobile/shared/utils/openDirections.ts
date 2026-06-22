import { Alert, Linking, Platform } from 'react-native';

export interface DirectionsOptions {
  latitude: number;
  longitude: number;
  label?: string;
}

export const openDirections = async ({
  latitude,
  longitude,
  label = 'Destination',
}: DirectionsOptions): Promise<void> => {
  if (
    latitude === undefined ||
    longitude === undefined ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    Alert.alert('Error', 'Invalid destination coordinates.');
    return;
  }

  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${latitude},${longitude}&q=${encodeURIComponent(
          label
        )}`
      : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  try {
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert('Error', 'Unable to open map application.');
      return;
    }

    await Linking.openURL(url);
  } catch (error) {
    console.error('Failed to open directions:', error);
    Alert.alert('Error', 'Failed to open directions.');
  }
};