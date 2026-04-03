import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedIcons } from '@/components/ThemedIcons';
import TextField from '@/components/TextField';
import LocationAutocomplete, { LocationItem } from '@/components/LocationAutocomplete';
import Button from '@/components/Button';
import { useLocation } from '@/context/LocationContext';
import RoundedButton from '../RoundedButton';

export interface Address {
  country?: string;
  region?: string;
  province?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  postal_code?: string;
}

export interface LocationItemWithAddress extends LocationItem {
  address: Address;
}

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onAddLocation: (location: LocationItemWithAddress, note: string) => void;
  isEditingLocation?: boolean;
  initialLocation?: LocationItemWithAddress;
}

export default function LocationPickerModal({
  visible,
  onClose,
  onAddLocation,
  isEditingLocation = false,
  initialLocation,
}: LocationPickerModalProps) {
  const { latitude, longitude } = useLocation();
  const [step, setStep] = useState<1 | 2>(1);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [modalLocationName, setModalLocationName] = useState('');
  const [modalNote, setModalNote] = useState('');
  const [modalLocationData, setModalLocationData] = useState<Partial<LocationItemWithAddress>>({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Parse address from Nominatim response
  const parseAddressFromNominatim = (addressData: any): Address => {
    return {
      country: addressData.address?.country || undefined,
      region: addressData.address?.state || undefined, // Nominatim uses 'state' for region
      province: addressData.address?.county || undefined, // Nominatim sometimes uses 'county' for province
      city: addressData.address?.city || addressData.address?.town || addressData.address?.village || undefined,
      district: addressData.address?.district || addressData.address?.suburb || undefined,
      neighborhood: addressData.address?.neighbourhood || addressData.address?.neighborhood || undefined,
      postal_code: addressData.address?.postcode || undefined,
    };
  };

  // Initialize state when modal opens or when editing a location
  useEffect(() => {
    if (visible) {
      setStep(1);
      if (isEditingLocation && initialLocation) {
        setModalLocationName(initialLocation.locationName || '');
        setModalNote(initialLocation.note || '');
        setModalLocationData(initialLocation);
        if (initialLocation.latitude && initialLocation.longitude) {
          setMapRegion({
            latitude: initialLocation.latitude,
            longitude: initialLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } else {
        // New location - initialize to current location or default
        setModalLocationName('');
        setModalNote('');
        setModalLocationData({});
        if (latitude && longitude) {
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } else {
          // Default to Cebu City
          setMapRegion({
            latitude: 10.3157,
            longitude: 123.8854,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      }
    }
    
    return () => {
      // Cleanup: clear debounce timer when modal closes
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [visible, isEditingLocation, initialLocation, latitude, longitude]);

  // Reverse geocode to get location name and address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setIsLoadingLocation(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'TaraG/1.0',
          },
        }
      );
      const data = await response.json();
      const address = parseAddressFromNominatim(data);
      
      // Extract location name - use first part of display_name before first comma to avoid duplication with address
      const displayName = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      const locationName = displayName.split(',')[0].trim();
      
      return { locationName, address };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return { 
        locationName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        address: {}
      };
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Handle map region change - update location data when user moves map
  const handleMapRegionChangeComplete = async (region: Region) => {
    // Debounce: clear previous timer and set a new one
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(async () => {
      const { locationName, address } = await reverseGeocode(region.latitude, region.longitude);
      setModalLocationName(locationName);
      setModalLocationData({
        locationName,
        latitude: region.latitude,
        longitude: region.longitude,
        address,
      });
    }, 500); // Wait 500ms after map stops moving before loading location
  };

  // Handle location selection from autocomplete - update map to show selected location
  const handleLocationSelect = (loc: LocationItem) => {
    setModalLocationName(loc.locationName || '');
    setModalLocationData(loc);
    // Update map region to the selected location
    if (loc.latitude && loc.longitude) {
      setMapRegion({
        latitude: loc.latitude,
        longitude: loc.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleNextStep = () => {
    if (modalLocationData && modalLocationData.locationName && modalLocationData.latitude && modalLocationData.longitude) {
      setStep(2);
    }
  };

  const handleAddLocation = () => {
    if (modalLocationData && modalLocationData.locationName && modalLocationData.latitude && modalLocationData.longitude && modalLocationData.address) {
      const locationToAdd = {
        ...modalLocationData,
        note: modalNote || '',
        address: modalLocationData.address || {},
      } as LocationItemWithAddress;
      onAddLocation(locationToAdd, modalNote);
      onClose();
    }
  };

  const handleBackStep = () => {
    setStep(1);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={{ flex: 1 }}>
          {/* Background Map */}
          {mapRegion && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                region={mapRegion}
                onRegionChangeComplete={handleMapRegionChangeComplete}
                scrollEnabled={step === 1}
                zoomEnabled={step === 1}
                pitchEnabled={step === 1}
                rotateEnabled={step === 1}
              />
              {/* Fixed center marker overlay */}
              <View style={styles.centerMarkerContainer}>
                <View style={styles.centerMarker} />
              </View>
            </View>
          )}

          {/* Layered Top Section with LinearGradient */}
          <LinearGradient
            colors={['#000', 'transparent']}
            style={styles.topSection}
          >
            <ThemedText style={{ marginBottom: 8, color: '#fff' }}>
              {step === 1 ? 'Select a location or navigate through the map' : 'Add a note (optional)'}
            </ThemedText>

            {step === 1 ? (
              <>
                <LocationAutocomplete
                  value={modalLocationName}
                  onSelect={handleLocationSelect}
                  placeholder="Search for a location or move the map"
                />
                <ThemedText style={{ fontSize: 11, opacity: 0.5, marginTop: 8 }}>
                  Move the map to select a location
                </ThemedText>
              </>
            ) : (
              <TextField
                placeholder="Add a note (optional)"
                value={modalNote}
                onChangeText={setModalNote}
                multiline
                style={{ minHeight: 60 }}
              />
            )}

          </LinearGradient>

        <LinearGradient
            colors={['transparent', '#000']}
            style={styles.bottomButtonContainer}
          >
            {step === 2 ? (<>
                <RoundedButton
                    iconName="arrow-left"
                    onPress={handleBackStep}
                    style={{backgroundColor: 'gray'}}
                />
                <RoundedButton
                    iconName="check"
                    onPress={handleAddLocation}
                />
            </>):(<>
                
            <View style={{ width: '80%' }}>
                  <ThemedText type="subtitle" style={{ color: '#fff', opacity: 1 }}>{isLoadingLocation ? 'Getting location...' : modalLocationName}</ThemedText>
                  <ThemedText style={{ color: '#fff'}}>Your Chosen Location</ThemedText>
                </View>
                <RoundedButton
                    iconName="arrow-right"
                    onPress={handleNextStep}
                />
            </>)}
          </LinearGradient>
        </ThemedView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  topSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
  },
  centerMarkerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  centerMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00CAFF',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 100,
  },
});
