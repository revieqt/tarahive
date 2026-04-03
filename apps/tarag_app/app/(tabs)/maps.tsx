import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRoute } from '@/context/RouteContext';
import ActiveRouteMap from '../maps/maps-activeRoute';
import HomeMap from '@/components/maps/HomeMap';

export default function MapsScreen() {
  const { activeRoute } = useRoute();
  return (
   <ThemedView style={{flex: 1}}>
      {activeRoute ? <ActiveRouteMap/ > : <HomeMap/>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  
});
