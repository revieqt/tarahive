import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useState } from 'react';
import { useRoute } from '@/context/RouteContext';
// adjust these imports based on your project structure
import { useSession } from '@/context/SessionContext';
import { generateRouteWithLocations } from '@/services/routeService';

export const useGetDirection = () => {
  const router = useRouter();
  const { session } = useSession();
  const { activeRoute, setActiveRoute } = useRoute();
  const [isLoading, setIsLoading] = useState(false);

  const getDirection = async (
    amenity: any,
    currentLocation?: { latitude: number; longitude: number }
  ) => {
    // Check if there's an active route
    if (activeRoute) {
      Alert.alert(
        "Active Route Detected",
        "You must end the active route before creating a new one.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    // Validate required data
    if (!currentLocation?.latitude || !currentLocation?.longitude || !session?.user?.id) {
      Alert.alert("Error", "Unable to get your location or user information.");
      return;
    }

    if (!amenity?.latitude || !amenity?.longitude) {
      Alert.alert("Error", "Amenity location is invalid.");
      return;
    }

    setIsLoading(true);

    try {
      const route = await generateRouteWithLocations({
        startLocation: currentLocation,
        endLocation: {
          latitude: amenity.latitude,
          longitude: amenity.longitude,
        },
        waypoints: [],
        mode: 'driving-car',
        userID: session.user.id,
      });

      if (!route) {
        Alert.alert("Error", "Failed to generate route. Please try again.");
        setIsLoading(false);
        return;
      }

      const newActiveRoute = {
        routeID: `route_${Date.now()}`,
        type: 'generated' as const,
        location: [
          {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            locationName: 'Your Location',
          },
          {
            latitude: amenity.latitude,
            longitude: amenity.longitude,
            locationName: amenity.name || 'Destination',
          },
        ],
        mode: 'driving-car',
        status: 'active',
        createdOn: new Date(),
        routeData: Array.isArray(route) ? route[0] : route,
      };

      // Set the active route
      await setActiveRoute(newActiveRoute);
      console.log('Route created:', newActiveRoute);

      // Navigate to maps with a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      router.replace('/(tabs)/maps');

    } catch (error) {
      console.error('Error generating route:', error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to generate route. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { getDirection, isLoading };
};