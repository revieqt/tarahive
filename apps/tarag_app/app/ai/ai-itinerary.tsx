import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { MAP_TYPES, PROVIDER_DEFAULT } from 'react-native-maps';
import TaraMarker from '@/components/maps/TaraMarker';
import { useMapType } from '@/hooks/useMapType';
import { useLocation } from '@/context/LocationContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useCreateItinerary } from '@/hooks/useItinerary';
import BackButton from '@/components/BackButton';
import { ThemedIcons } from '@/components/ThemedIcons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ProcessModal from '@/components/modals/ProcessModal';
import { formatDateToString } from '@/utils/formatDateToString';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LocationDisplay from '@/components/LocationDisplay';

interface LocationWithDate {
  locationName?: string;
  latitude: number;
  longitude: number;
  address?: {
    city?: string;
    district?: string;
    region?: string;
    country?: string;
  };
  note?: string;
  date?: string;
}

export default function AiItineraryScreen() {
  const router = useRouter();
  const { itineraryData } = useLocalSearchParams<{ itineraryData: string }>();
  const { mapType: currentMapType } = useMapType();
  const { latitude: userLat, longitude: userLng } = useLocation();
  const secondaryColor = useThemeColor({}, 'secondary');
  const primaryColor = useThemeColor({}, 'primary');
  
  const mapRef = useRef<MapView>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithDate | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processStatus, setProcessStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [processMessage, setProcessMessage] = useState('');
  const [is3DMode, setIs3DMode] = useState(true);
  const [currentHeading, setCurrentHeading] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const createItineraryMutation = useCreateItinerary();

  const parsedData = useMemo(() => {
    try {
      return itineraryData ? JSON.parse(itineraryData) : null;
    } catch (error) {
      console.error('Failed to parse itinerary data:', error);
      return null;
    }
  }, [itineraryData]);

  // Extract all locations from nested structure
  const allMapLocations: LocationWithDate[] = useMemo(() => {
    if (!parsedData) return [];
    
    const locations: LocationWithDate[] = [];
    
    // Try to extract locations from various structures
    const extractLocations = (obj: any, depth = 0): void => {
      if (depth > 5) return; // Prevent infinite recursion
      
      if (!obj) return;
      
      // Check if this is a location object
      if (
        typeof obj === 'object' &&
        typeof obj.latitude === 'number' &&
        typeof obj.longitude === 'number'
      ) {
        locations.push({
          locationName: obj.locationName || obj.name || 'Location',
          latitude: obj.latitude,
          longitude: obj.longitude,
          address: obj.address,
          note: obj.note || obj.description,
          date: obj.date,
        });
        return;
      }
      
      // Recurse through arrays and objects
      if (Array.isArray(obj)) {
        obj.forEach((item) => extractLocations(item, depth + 1));
      } else if (typeof obj === 'object') {
        Object.values(obj).forEach((value) => extractLocations(value, depth + 1));
      }
    };
    
    extractLocations(parsedData);
    return locations;
  }, [parsedData]);

  const mapInitialRegion = useMemo(() => {
    if (allMapLocations.length > 0) {
      return {
        latitude: allMapLocations[0].latitude,
        longitude: allMapLocations[0].longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    
    if (userLat && userLng) {
      return {
        latitude: userLat,
        longitude: userLng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    
    return {
      latitude: 10.3157,
      longitude: 123.8854,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }, [allMapLocations, userLat, userLng]);

  const getMapTypeEnum = (mapType: string) => {
    switch (mapType) {
      case 'satellite':
        return MAP_TYPES.SATELLITE;
      case 'hybrid':
        return MAP_TYPES.HYBRID;
      case 'terrain':
        return MAP_TYPES.TERRAIN;
      case 'standard':
      default:
        return MAP_TYPES.STANDARD;
    }
  };

  const handleMarkerPress = (location: LocationWithDate) => {
    setSelectedLocation(location);
  };

  const handleLocationClick = (location: LocationWithDate) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
    setSelectedLocation(location);
    setCurrentHeading(0);
  };

  const handleSearchLocation = async (location: LocationWithDate) => {
    try {
      const searchQuery = encodeURIComponent(location.locationName || 'location');
      const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
      await Linking.openURL(googleSearchUrl);
    } catch (error) {
      Alert.alert('Error', 'Unable to open search. Please try again.');
    }
  };

  const formatMapDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';
    
    try {
      if (typeof dateValue === 'string') {
        return dateValue.slice(0, 10);
      }
      if (dateValue instanceof Date) {
        return dateValue.toISOString().slice(0, 10);
      }
      if (typeof dateValue === 'number') {
        return new Date(dateValue).toISOString().slice(0, 10);
      }
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate().toISOString().slice(0, 10);
      }
      return 'Invalid Date';
    } catch (error) {
      console.warn('Error formatting date:', dateValue, error);
      return 'Invalid Date';
    }
  };

  const renderDayLocations = (loc: any) => {
    return (
      <LocationDisplay
        content={loc.locations && Array.isArray(loc.locations) ? loc.locations.map((l: any, i: number) => (
          <TouchableOpacity
            key={i}
            style={{flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'space-between', marginBottom: 10}}
            onPress={() => handleLocationClick(l)}
            activeOpacity={0.7}
          >
            <View>
              <ThemedText>{l.locationName} </ThemedText>
              {l.address && (l.address.city || l.address.district || l.address.region) && (
                <ThemedText style={{opacity: .6, fontSize: 12}}>
                  {[l.address.district, l.address.city, l.address.region].filter(Boolean).join(', ')}
                </ThemedText>
              )}
              <ThemedText style={{opacity: .5}}>{l.note ? `${l.note}` : ''}</ThemedText>
            </View>
          </TouchableOpacity>
        )) : []}
      />
    );
  };

  // Reset to 2D when no location is selected
  useEffect(() => {
    if (!selectedLocation) {
      setCurrentHeading(0);
    }
  }, [selectedLocation]);

  // Start 360-degree rotation animation around selected location
  useEffect(() => {
    if (!selectedLocation || !is3DMode || !mapRef.current) {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    // Clear any existing animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    // Start new rotation
    animationRef.current = setInterval(() => {
      setCurrentHeading(prev => (prev + 0.5) % 360);
    }, 100);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [selectedLocation, is3DMode]);

  // Animate camera for 3D rotation effect around selected location or 2D overhead view
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    // If no location is selected, always show 2D view
    if (!selectedLocation) {
      mapRef.current.animateCamera({
        center: {
          latitude: mapInitialRegion.latitude,
          longitude: mapInitialRegion.longitude,
        },
        pitch: 0,
        heading: 0,
        zoom: 16,
        altitude: 0,
      }, {
        duration: 300,
      });
      return;
    }

    // If location is selected, apply 3D or 2D based on mode
    if (is3DMode) {
      mapRef.current.animateCamera({
        center: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        },
        pitch: 45,
        heading: currentHeading,
        zoom: 18,
        altitude: 500,
      }, {
        duration: 100,
      });
    } else {
      mapRef.current.animateCamera({
        center: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        },
        pitch: 0,
        heading: 0,
        zoom: 18,
        altitude: 0,
      }, {
        duration: 300,
      });
    }
  }, [selectedLocation, currentHeading, is3DMode, mapInitialRegion]);

  const handleSaveItinerary = async () => {
    if (!parsedData) {
      setProcessStatus('error');
      setProcessMessage('No itinerary data to save');
      setShowProcessModal(true);
      return;
    }

    setShowProcessModal(true);
    setProcessStatus('processing');
    setProcessMessage('Saving itinerary...');

    try {
      await createItineraryMutation.mutateAsync({
        title: parsedData.title || 'AI Generated Itinerary',
        description: parsedData.description || '',
        startDate: parsedData.startDate,
        endDate: parsedData.endDate,
        locations: parsedData.locations || [],
        type: parsedData.type || 'ai-generated',
        planDaily: parsedData.planDaily ?? true,
      });

      setProcessStatus('success');
      setProcessMessage('Itinerary saved successfully!');
    } catch (error) {
      setProcessStatus('error');
      setProcessMessage(
        error instanceof Error ? error.message : 'Failed to save itinerary'
      );
    }
  };

  if (!parsedData) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Unable to load itinerary</ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{flex: 1}}>
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={mapInitialRegion}
            mapType={getMapTypeEnum(currentMapType)}
            showsUserLocation={true}
          >
            {allMapLocations.map((loc, idx) => (
              <TaraMarker
                key={`${loc.latitude},${loc.longitude},${idx}`}
                coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                onPress={() => handleMarkerPress(loc)}
                type="dot"
                color="limegreen"
              />
            ))}
          </MapView>
        </View>

        <LinearGradient colors={['#000', 'transparent']} style={styles.headerGradient}>
          <ThemedText type="subtitle" style={{ color: '#fff' }}>
            {parsedData.title}
          </ThemedText>
          <View style={styles.detailsContainer}>
            <ThemedIcons name="calendar" size={13} color="#fff"/>
            <ThemedText style={{ color: '#fff', fontSize: 11 }}>
              {formatDateToString(parsedData?.startDate || "")} - {formatDateToString(parsedData?.endDate || "")}
            </ThemedText>
          </View>
          <View style={styles.detailsContainer}>
            <ThemedIcons name="tag" size={13} color="#fff"/>
            <ThemedText style={{ color: '#fff', fontSize: 11 }}>
              {parsedData?.type}
            </ThemedText>
          </View>
          <View style={styles.detailsContainer}>
            <ThemedIcons name="pencil" size={13} color="#fff"/>
            <ThemedText style={{ color: '#fff', fontSize: 11 }}>
              Generated by AI. Save to edit and customize.
            </ThemedText>
          </View>

        </LinearGradient>

        {selectedLocation ? (
          <LinearGradient colors={['transparent', '#000']} style={styles.bottomGradient}>
            <TouchableOpacity onPress={() => setSelectedLocation(null)} style={styles.goBack}>
              <ThemedIcons name="arrow-left" size={20} color="#fff" />
              <ThemedText style={{ color: '#fff', fontSize: 11 }}>Back</ThemedText>
            </TouchableOpacity>
            <ThemedText type="subtitle" style={{ color: '#fff' }}>
              {selectedLocation.locationName}
            </ThemedText>
            {selectedLocation.address &&
              (selectedLocation.address.city ||
                selectedLocation.address.district ||
                selectedLocation.address.region ||
                selectedLocation.address.country) && (
                <ThemedText style={{ color: '#fff', opacity: 0.7, marginBottom: 8, fontSize: 12 }}>
                  {[
                    selectedLocation.address.district,
                    selectedLocation.address.city,
                    selectedLocation.address.region,
                    selectedLocation.address.country,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </ThemedText>
              )}

            <View style={styles.locationButtonsContainer}>
              <TouchableOpacity 
                style={[styles.locationButtons, {backgroundColor: is3DMode ? secondaryColor : '#0008'}]}
                onPress={() => setIs3DMode(!is3DMode)}
              >
                <ThemedIcons name={is3DMode ? "cube-outline" : "square-outline"} size={20} color="#fff" />
                <ThemedText style={{color: '#fff', fontSize: 11}}>{is3DMode ? '3D' : '2D'}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.locationButtons}
                onPress={() => handleSearchLocation(selectedLocation)}
              >
                <ThemedIcons name="magnify" size={20} color="#fff" />
                <ThemedText style={{ color: '#fff', fontSize: 11 }}>Search</ThemedText>
              </TouchableOpacity>
              
            </View>

            {selectedLocation.note && (
              <ThemedText style={styles.locationNote}>{selectedLocation.note}</ThemedText>
            )}
          </LinearGradient>
        ) : (
          <ThemedView style={styles.bottomSheet} color="primary">
            <ScrollView contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 16 }}>
              <ThemedText style={styles.description}>
                {parsedData.description || ''}
              </ThemedText>
              {Array.isArray(parsedData.locations) && parsedData.locations.length > 0 && (
                // Check if planDaily (has nested locations) or direct locations
                (parsedData.locations[0] as any)?.locations ? (
                // planDaily = true: locations have date and nested locations array
                parsedData.locations.map((loc: any, idx: number) => (
                  <View key={idx}>
                    {loc.date && (
                      <>
                        <ThemedText type='subtitle' style={{fontSize: 15}}>Day {idx + 1}</ThemedText>
                        <ThemedText style={{marginBottom: 12, opacity: .5}}>({formatDateToString(loc.date)})</ThemedText>
                      </>
                    )}
                    {renderDayLocations(loc)}
                  </View>
                ))
                ) : (
                // planDaily = false: locations are direct objects
                <LocationDisplay
                  content={parsedData.locations.map((loc: any, i: number) => (
                    <TouchableOpacity
                      key={i}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        justifyContent: 'space-between',
                        marginBottom: 10,
                      }}
                      onPress={() => handleLocationClick(loc)}
                      activeOpacity={0.7}
                    >
                      <View>
                        <ThemedText>{loc.locationName}</ThemedText>
                        {loc.address &&
                          (loc.address.city || loc.address.district || loc.address.region) && (
                            <ThemedText style={{ opacity: 0.6, fontSize: 12 }}>
                              {[loc.address.district, loc.address.city, loc.address.region]
                                .filter(Boolean)
                                .join(', ')}
                            </ThemedText>
                          )}
                        {loc.note && <ThemedText style={{ opacity: 0.5 }}>{loc.note}</ThemedText>}
                      </View>
                    </TouchableOpacity>
                  ))}
                />
                )
              )}
            </ScrollView>
          </ThemedView>
        )}
      </View>
      <ThemedView style={[styles.optionsContainer, { backgroundColor: selectedLocation ? '#000' : primaryColor }]} color="primary">
        <BackButton/>
        <ThemedText style={{flex: 1, color: selectedLocation ? 'white' : ''}}>Go Back</ThemedText>
        <TouchableOpacity style={[styles.saveButton, {backgroundColor: secondaryColor}]} onPress={handleSaveItinerary} disabled={createItineraryMutation.isPending}>
          <ThemedIcons name="check" size={20} color="#fff" />
          <ThemedText style={{ color: '#fff'}}>{createItineraryMutation.isPending ? 'Saving...' : 'Save Itinerary'}</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ProcessModal
        visible={showProcessModal}
        status={processStatus}
        message={processMessage}
        onClose={() => {
          if (processStatus === 'success') {
            setShowProcessModal(false);
            router.back();
          } else {
            setShowProcessModal(false);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    borderRadius: 10,
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 50,
    gap: 3,
    zIndex: 1,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
  },
  goBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0008',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
    opacity: 0.7,
  },
  locationButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginVertical: 5,
    paddingBottom: 10,
  },
  locationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0008',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '40%',
    borderBottomWidth: 1,
    borderBottomColor: '#0004',
    overflow: 'hidden',
  },
  description: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc4',
    paddingBottom: 10,
    marginBottom: 10,
  },
  locationNote: {
    zIndex: 100,
    color: '#fff',
    backgroundColor: '#0005',
    padding: 10,
    borderRadius: 10,
  },
  optionsContainer:{
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,    
    borderRadius: 20,
  }
});