import LocationAutocomplete, { LocationItem } from '@/components/LocationAutocomplete';
import { useRef, useEffect } from 'react';
import MapView from 'react-native-maps';
import { ThemedText } from '@/components/ThemedText';
import { ThemedIcons } from '@/components/ThemedIcons';
import RoundedButton from '@/components/RoundedButton';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState  } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Alert} from 'react-native';
import { useLocation } from '@/context/LocationContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRoute } from '@/context/RouteContext';
import { useSession } from '@/context/SessionContext';
import { getRoutes } from '@/services/routeService';
import BackButton from '@/components/BackButton';
import { router, useLocalSearchParams } from 'expo-router';
import { Polyline } from 'react-native-maps';
import PointMarker from '@/components/maps/PointMarker';
import Button from '@/components/Button';
import ProcessModal from '@/components/modals/ProcessModal';

const MODES = [
  { label: 'Car', value: 'driving-car', icon: 'car'},
  { label: 'Bicycle', value: 'cycling-regular', icon: 'bike'},
  { label: 'Walking', value: 'foot-walking', icon: 'walk'},
  { label: 'Hiking', value: 'foot-hiking', icon: 'hiking'},
];

export default function CreateRouteScreen() {
  const { latitude: paramLatitude, longitude: paramLongitude, locationName: paramLocationName } = useLocalSearchParams<{ 
    latitude?: string;
    longitude?: string;
    locationName?: string;
  }>();
  const [endLocation, setEndLocation] = useState<LocationItem | null>(null);
  const [waypoints, setWaypoints] = useState<LocationItem[]>([]);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [routesData, setRoutesData] = useState<any[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchedLocations, setSearchedLocations] = useState<LocationItem[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<{latitude: number, longitude: number}[]>([]);
  const [animatedCoordinates, setAnimatedCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [skipForm, setSkipForm] = useState(false);

  // Initialize end location if parameters provided
  useEffect(() => {
    if (paramLatitude && paramLongitude && paramLocationName) {
      const location: LocationItem = {
        locationName: paramLocationName,
        latitude: parseFloat(paramLatitude),
        longitude: parseFloat(paramLongitude),
        note: ''
      };
      setEndLocation(location);
      setSearchedLocations([location]);
      setSkipForm(true);
      // Auto-select Car mode when coming from nearby help
      setSelectedMode('driving-car');
      console.log('Route parameters provided, skipping form:', location);
    }
  }, [paramLatitude, paramLongitude, paramLocationName]);

  // Auto-fit map when searched locations change (but not during route generation)
//   useEffect(() => {
//     if (searchedLocations.length > 0 && !isGenerating) {
//       console.log('Fitting map to', searchedLocations.length, 'searched locations');
//       setTimeout(() => fitMapToLocations(), 300);
//     }
//   }, [searchedLocations, isGenerating]);

  const secondaryColor = useThemeColor({}, 'secondary');
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  const { setActiveRoute } = useRoute();
  const { session } = useSession();

  const { loading, suburb , city, latitude, longitude } = useLocation();

  const mapRef = useRef<MapView>(null);

  // Auto-generate route when parameters are provided and dependencies are ready
  useEffect(() => {
    if (skipForm && selectedMode && endLocation && latitude && longitude && !isGenerating && routesData.length === 0) {
      console.log('Auto-generating route with parameters');
      handleGenerateRoute();
    }
  }, [skipForm, selectedMode, endLocation, latitude, longitude]);

  // Function to fit map to show all locations including route coordinates
  const fitMapToLocations = () => {
    if (!mapRef.current || !latitude || !longitude) {
      console.log('Cannot fit map: missing mapRef or location');
      return;
    }
    
    let allLocations = [
      { latitude: latitude as number, longitude: longitude as number },
      ...searchedLocations.filter(loc => loc.latitude && loc.longitude).map(loc => ({
        latitude: loc.latitude!,
        longitude: loc.longitude!
      }))
    ];
    
    // Don't include route coordinates in fitting to prevent zoom out
    // Only fit to user location and searched locations (waypoints)
    
    console.log('Fitting map to', allLocations.length, 'locations');
    
    if (allLocations.length > 1) {
      mapRef.current.fitToCoordinates(allLocations, {
        edgePadding: { top: 80, right: 50, bottom: 150, left: 50 },
        animated: true
      });
    } else if (allLocations.length === 1) {
      mapRef.current.animateToRegion({
        latitude: allLocations[0].latitude,
        longitude: allLocations[0].longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      }, 1000);
    }
  };

  // Animation function for polyline
  const animatePolyline = (coordinates: {latitude: number, longitude: number}[]) => {
    console.log('Starting polyline animation with', coordinates.length, 'coordinates');
    setAnimatedCoordinates([]);
    let index = 0;
    const totalDuration = 1000; // 2 seconds
    const startTime = Date.now();
    
    const animationFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      const targetIndex = Math.floor(progress * coordinates.length);
      
      if (targetIndex > index) {
        index = targetIndex;
        const currentCoords = coordinates.slice(0, Math.min(index + 1, coordinates.length));
        setAnimatedCoordinates(currentCoords);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animationFrame);
      } else {
        // Animation complete
        console.log('Animation completed - returning to fit all locations');
        setAnimatedCoordinates(coordinates);
        setTimeout(() => fitMapToLocations(), 500);
      }
    };
    
    requestAnimationFrame(animationFrame);
  };

  // Handle end location selection
  const handleEndLocationSelect = (location: LocationItem) => {
    console.log('End location selected:', location);
    setEndLocation(location);
    
    // Add to searched locations for map markers
    if (location.latitude && location.longitude) {
      setSearchedLocations(prev => {
        const exists = prev.some(loc => 
          loc.latitude === location.latitude && loc.longitude === location.longitude
        );
        if (!exists) {
          const newLocations = [...prev, location];
          console.log('Updated searched locations:', newLocations);
          // Fit map to show all locations after state update
          setTimeout(() => fitMapToLocations(), 100);
          return newLocations;
        }
        return prev;
      });
    }
  };

  const handleAddWaypoint = () => {
    setWaypoints([...waypoints, { locationName: '', latitude: null, longitude: null, note: '' }]);
  };

  const handleWaypointSelect = (index: number, location: LocationItem) => {
    console.log('Waypoint selected:', location);
    const updatedWaypoints = [...waypoints];
    updatedWaypoints[index] = location;
    setWaypoints(updatedWaypoints);
    
    // Add to searched locations for map markers
    if (location.latitude && location.longitude) {
      setSearchedLocations(prev => {
        const exists = prev.some(loc => 
          loc.latitude === location.latitude && loc.longitude === location.longitude
        );
        if (!exists) {
          const newLocations = [...prev, location];
          console.log('Updated searched locations:', newLocations);
          // Fit map to show all locations after state update
          setTimeout(() => fitMapToLocations(), 100);
          return newLocations;
        }
        return prev;
      });
    }
  };

  const handleRemoveWaypoint = (index: number) => {
    const updatedWaypoints = waypoints.filter((_, i) => i !== index);
    setWaypoints(updatedWaypoints);
  };

  const handleModeToggle = (value: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedMode(value);
    } else {
      setSelectedMode(null);
    }
  };

  const handlePreviousRoute = () => {
    if (selectedRouteIndex > 0) {
      const newIndex = selectedRouteIndex - 1;
      setSelectedRouteIndex(newIndex);
      console.log(`Showing route ${newIndex + 1} of ${routesData.length}`);
      
      // Update map polyline for new route instantly (no animation for route switching)
      const newRoute = routesData[newIndex];
      if (newRoute.geometry?.coordinates?.length > 0) {
        const coordinates = newRoute.geometry.coordinates.map((coord: any) => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        setRouteCoordinates(coordinates);
        setAnimatedCoordinates(coordinates);
      }
    }
  };

  const handleNextRoute = () => {
    if (selectedRouteIndex < routesData.length - 1) {
      const newIndex = selectedRouteIndex + 1;
      setSelectedRouteIndex(newIndex);
      console.log(`Showing route ${newIndex + 1} of ${routesData.length}`);
      
      // Update map polyline for new route instantly (no animation for route switching)
      const newRoute = routesData[newIndex];
      if (newRoute.geometry?.coordinates?.length > 0) {
        const coordinates = newRoute.geometry.coordinates.map((coord: any) => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        setRouteCoordinates(coordinates);
        setAnimatedCoordinates(coordinates);
      }
    }
  };

  const handleGenerateRoute = async () => {
    if (!selectedMode || !endLocation || !latitude || !longitude) {
      console.log('Missing required data for route generation');
      return;
    }

    setIsGenerating(true);
    try {
      // Build location array: start -> waypoints -> end
      const locationArray = [
        { latitude: latitude as number, longitude: longitude as number }, // Starting location
        ...waypoints.filter(wp => wp.latitude && wp.longitude).map(wp => ({
          latitude: wp.latitude!,
          longitude: wp.longitude!
        })), // Waypoints
        { latitude: endLocation.latitude!, longitude: endLocation.longitude! } // End location
      ];

      const routes = await getRoutes({
        location: locationArray,
        mode: selectedMode,
        accessToken: session?.accessToken || ''
      });

      if (routes && routes.length > 0) {
        setRoutesData(routes);
        setSelectedRouteIndex(0);
        console.log('Routes generated:', routes.length, 'alternatives');
        
        // Extract coordinates for first route polyline
        const firstRoute = routes[0];
        if (firstRoute.geometry && firstRoute.geometry.coordinates && firstRoute.geometry.coordinates.length > 0) {
          console.log('First route geometry found:', firstRoute.geometry);
          const coordinates = firstRoute.geometry.coordinates.map((coord: any) => ({
            latitude: coord[1],
            longitude: coord[0]
          }));
          console.log('Extracted coordinates:', coordinates.length, 'points');
          setRouteCoordinates(coordinates);
          animatePolyline(coordinates);
        }
      } else {
        console.log('Failed to generate routes');
      }
    } catch (error) {
      console.error('Error generating route:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelRoute = async () => {
    Alert.alert(
      "Cancel Route",
      "Are you sure you want to cancel the route?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Cancel Route", 
          style: "destructive",
          onPress: async () => {
            router.back();
          }
        }
      ]
    );
  };

  const handleStartRoute = async () => {
    if (!routesData || routesData.length === 0 || !selectedMode || !endLocation || !latitude || !longitude) {
      console.log('Missing required data for starting route');
      return;
    }

    try {
      // Get the selected route
      const selectedRoute = routesData[selectedRouteIndex];
      
      // Build location array with names for ActiveRoute
      const locationArray = [
        { 
          latitude: latitude as number, 
          longitude: longitude as number, 
          locationName: `${suburb}, ${city}` 
        },
        ...waypoints.filter(wp => wp.latitude && wp.longitude).map(wp => ({
          latitude: wp.latitude!,
          longitude: wp.longitude!,
          locationName: wp.locationName
        })),
        { 
          latitude: endLocation.latitude!, 
          longitude: endLocation.longitude!,
          locationName: endLocation.locationName 
        }
      ];

      const activeRoute = {
        routeID: `route_${Date.now()}`,
        type: 'generated' as const,
        location: locationArray,
        mode: selectedMode,
        status: 'active',
        createdOn: new Date(),
        routeData: selectedRoute
      };

      await setActiveRoute(activeRoute);
      console.log('Route saved to RouteContext:', activeRoute);

      try {
        await new Promise(resolve => setTimeout(resolve, 50));
        router.replace('/(tabs)/maps');
      } catch (navError) {
        console.error('Navigation error:', navError);
        router.push('/(tabs)/maps');
      }
    } catch (error) {
      console.error('Error starting route:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1, zIndex: 1 }}
        initialRegion={{
          latitude: latitude || 14.5995, // User location or Manila coords
          longitude: longitude || 120.9842,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* User Location Marker */}
        {latitude && longitude && (
          <PointMarker
            key="user-location"
            coordinate={{
              latitude: latitude,
              longitude: longitude
            }}
          />
        )}

        {/* Searched Location Markers - Using TaraMarker */}
        {searchedLocations.map((location, index) => {
          if (!location.latitude || !location.longitude) {
            console.log(`Skipping TaraMarker ${index}: missing coordinates`);
            return null;
          }
          console.log(`Rendering TaraMarker ${index + 1} at:`, location.latitude, location.longitude, 'with color:', '#FF6B6B');
          console.log(`TaraMarker coordinate validation:`, {
            lat: typeof location.latitude,
            lng: typeof location.longitude,
            latValue: location.latitude,
            lngValue: location.longitude
          });
          return (
            <PointMarker
              key={`searched-${index}-${location.latitude}-${location.longitude}`}
              coordinate={{
                latitude: Number(location.latitude),
                longitude: Number(location.longitude)
              }}
              title={location.locationName}
            />
          );
        })}
        
        
        {/* Animated Route Polyline */}
        {animatedCoordinates.length > 1 && (
          <Polyline
            coordinates={animatedCoordinates}
            strokeColor={secondaryColor}
            strokeWidth={6}
          />
        )}
      </MapView>

      <LinearGradient
        colors={[backgroundColor, 'transparent']}
        style={styles.header}
      >
        {routesData.length > 0? (
          <>
            <ThemedText type="title">
              {(routesData[selectedRouteIndex].distance / 1000).toFixed(2)} km • {Math.round(routesData[selectedRouteIndex].duration / 60)} min
            </ThemedText>
            <ThemedText style={{flexWrap: 'wrap'}}>
              Your Location {waypoints.length > 0 && waypoints.map(wp => wp.locationName ? ` → ${wp.locationName}` : '').join('')} → {endLocation?.locationName}
            </ThemedText>
          </>
        ) : (!skipForm ? (
          <>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10}}>
              <BackButton type='default'/>
              <ThemedText>Your Location to</ThemedText>
            </View>
            
            <TouchableOpacity style={[styles.addWaypointButton, {backgroundColor: primaryColor}]} onPress={handleAddWaypoint}>
              <ThemedText>Add Stop</ThemedText>
            </TouchableOpacity>

            {waypoints.map((waypoint, index) => (
            <View key={`waypoint-${index}`}>
            <TouchableOpacity 
              onPress={() => handleRemoveWaypoint(index)}
              style={styles.removeButton}
            >
              <ThemedIcons name="close" size={25} color="#ff4444" />
            </TouchableOpacity>
            <LocationAutocomplete
              value={waypoint.locationName}
              onSelect={(location) => handleWaypointSelect(index, location)}
              placeholder={`Enter waypoint ${index + 1}`}
              style={{ zIndex: 100 - index}}
            />
          </View>))}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modeRowContent}
          >
            {MODES.map((mode) => (
              <TouchableOpacity
                key={mode.value}
                onPress={() => handleModeToggle(mode.value, true)}
                style={[
                  styles.modeButton,
                  selectedMode === mode.value ? {backgroundColor: secondaryColor} : {backgroundColor: primaryColor}
                ]}
              >
                <ThemedIcons name={mode.icon} size={15} color="#ccc"/>
                <ThemedText style={
                  selectedMode === mode.value && {color: '#fff'}
                }>
                  {mode.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View key="end">
            <LocationAutocomplete
              value={endLocation?.locationName || ''}
              onSelect={handleEndLocationSelect}
              placeholder="Enter destination"
              style={{ zIndex: 100 - waypoints.length}}
            />
          </View>
          
          </>
        ) : (
          <>
            <ThemedText>Destination: {endLocation?.locationName}</ThemedText>
          </>
        ))}
      </LinearGradient>

      
        {routesData.length > 0? (
          <>
            {routesData.length > 1 && (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.sideButton} onPress={handlePreviousRoute}>
                  <ThemedIcons name="chevron-left" size={20} color="#fff" />
                </TouchableOpacity>

                <View style={styles.routeInfo}>
                  <ThemedText>Route {selectedRouteIndex + 1} of {routesData.length}</ThemedText>
                </View>

                <TouchableOpacity style={styles.sideButton} onPress={handleNextRoute}>
                  <ThemedIcons name="chevron-right" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={[styles.startButton]} onPress={handleStartRoute}>
                <ThemedIcons name="play" size={32} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.otherButtonsContainer}>
              <Button
                title="Go Back"
                onPress={
                skipForm ? () => router.back() : () => {
                  setRoutesData([]);
                  setSearchedLocations([]);
                  setEndLocation(null);
                  setWaypoints([]);
                  setAnimatedCoordinates([]);
                  setRouteCoordinates([]);
                }}
                buttonStyle={{flex: 1}}
              />
              <Button
                title="Cancel Route"
                onPress={handleCancelRoute}
                buttonStyle={{flex: 1}}
              />
            </View>
          </>
        ) : (skipForm ? (
          <RoundedButton
            iconName="arrow-right"
            onPress={handleGenerateRoute}
            style={styles.generateButton}
            disabled={isGenerating || !selectedMode || !endLocation}
            loading={isGenerating}
          />
        ) : null)}
      
      <ProcessModal 
        visible={skipForm && (isGenerating || loading)}
        status="processing"
        message="Generating route..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    pointerEvents: 'box-none',
    padding: 16,
    paddingBottom: 100,
  },
  addWaypointButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 7,
    top: 16,
    zIndex: 20,
    borderWidth: 1,
    borderColor: '#ccc4',
  },
  removeButton: {
    position: 'absolute',
    right: 40,
    top: 11,
    zIndex: 20,
  },
  modeRowContent: {
    flexDirection: 'row',
    gap: 5,
  },
  modeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 7,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 75,
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 15,
  },
  startButton:{
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButton:{
    backgroundColor: 'rgba(0,0,0,.5)',
    padding: 10,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeInfo: {
    backgroundColor: 'rgba(0,0,0,.5)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 20,
  },
  otherButtonsContainer: {
    position: 'absolute',
    bottom:16,
    left: 16,
    right: 16,
    zIndex: 15,
    flexDirection: 'row',
    gap: 7,
  }
});