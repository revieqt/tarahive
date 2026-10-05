import { ActivityIndicator, StyleSheet, View } from 'react-native';
import OSMMapView from '@/components/ui/OSMMapView';
import { TText } from '@/components/ui/Themed';
import { useLocation } from '@/context/LocationContext';

export default function MapRoomScreen() {
  const { latitude, longitude, hasLocation, error } = useLocation();

  if (!hasLocation) {
    return (
      <View style={styles.container}>
        {error ? <TText>{error}</TText> : <ActivityIndicator />}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OSMMapView latitude={latitude} longitude={longitude} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
