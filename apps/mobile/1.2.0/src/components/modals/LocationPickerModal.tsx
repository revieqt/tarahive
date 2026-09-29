import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TView, TText } from '@/components/ui/Themed';
import WeatherDisplay from '@/components/common/WeatherDisplay';
import LocationAutocomplete, { LocationItem } from '@/components/ui/LocationField';
import RoundButton from '@/components/ui/RoundButton';
import OSMMapView, { OSMMapViewRef } from '@/components/ui/OSMMapView';
import { useLocation } from '@/context/LocationContext';
import { usePlaceWeather } from '@/hooks/shared/useWeather';

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
  onAddLocation: (location: LocationItemWithAddress) => void;
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
  const { latitude, longitude, city: currentCity } = useLocation();

  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  const [locationData, setLocationData] = useState<Partial<LocationItemWithAddress>>({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const mapRef = useRef<OSMMapViewRef>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const weatherLatitude = locationData.latitude ?? latitude;
  const weatherLongitude = locationData.longitude ?? longitude;
  const weatherCity = locationData.address?.city || locationData.locationName || locationName || currentCity;
  const { data: weather, isLoading: weatherLoading } = usePlaceWeather(
    weatherLatitude,
    weatherLongitude,
    weatherCity,
  );

  // ── Helpers ────────────────────────────────────────────────────────────────

  const parseAddress = (data: any): Address => ({
    country: data.address?.country,
    region: data.address?.state,
    province: data.address?.county,
    city: data.address?.city ?? data.address?.town ?? data.address?.village,
    district: data.address?.district ?? data.address?.suburb,
    neighborhood: data.address?.neighbourhood ?? data.address?.neighborhood,
    postal_code: data.address?.postcode,
  });

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setIsLoadingLocation(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'TaraG/1.0' } }
      );
      const data = await res.json();
      const address = parseAddress(data);
      const name = (data.display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        .split(',')[0]
        .trim();
      return { name, address };
    } catch {
      return { name: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, address: {} };
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const panMapTo = (lat: number, lng: number) => {
    mapRef.current?.setCenter(lat, lng);
  };

  // ── Init on open ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!visible) return;

    let initLat: number;
    let initLng: number;

    if (isEditingLocation && initialLocation?.latitude && initialLocation?.longitude) {
      initLat = initialLocation.latitude;
      initLng = initialLocation.longitude;
      setLocationName(initialLocation.locationName ?? '');
      setLocationData(initialLocation);
    } else {
      initLat = latitude ?? 10.3157;
      initLng = longitude ?? 123.8854;
      setLocationName('');
      setLocationData({});
    }

    setCenterCoords({ lat: initLat, lng: initLng });
    panMapTo(initLat, initLng);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [visible, isEditingLocation, initialLocation, latitude, longitude]);

  const handleRegionChange = (lat: number, lng: number) => {
    setCenterCoords({ lat, lng });
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      const { name, address } = await reverseGeocode(lat, lng);
      setLocationName(name);
      setLocationData({ locationName: name, latitude: lat, longitude: lng, address });
    }, 0);
  };

  // ── Autocomplete selection ─────────────────────────────────────────────────

  const handleLocationSelect = async (loc: LocationItem) => {
    setLocationName(loc.locationName ?? '');
    if (loc.latitude !== null && loc.longitude !== null) {
      const { address } = await reverseGeocode(loc.latitude, loc.longitude);
      setLocationData({ ...loc, address });
    } else {
      setLocationData(loc);
    }
    if (loc.latitude !== null && loc.longitude !== null) {
      setCenterCoords({ lat: loc.latitude, lng: loc.longitude });
      panMapTo(loc.latitude, loc.longitude);
    }
  };

  // ── Confirm ────────────────────────────────────────────────────────────────

  const handleConfirm = () => {
    if (
      locationData.locationName &&
      locationData.latitude &&
      locationData.longitude &&
      locationData.address
    ) {
      onAddLocation({
        ...locationData,
        address: locationData.address ?? {},
      } as LocationItemWithAddress);
      onClose();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TView style={{ flex: 1 }}>
        {centerCoords ? (
          <View style={styles.mapContainer}>
            <OSMMapView
              ref={mapRef}
              latitude={centerCoords.lat}
              longitude={centerCoords.lng}
              onRegionChange={handleRegionChange}
              showMarker={false}
              showCenterMarker
              zoom={16}
            />
          </View>
        ) : null}

        {/* Top overlay */}
        <LinearGradient colors={['#000', 'transparent']} style={styles.topSection}>
          <TText style={{ marginBottom: 8, color: '#fff' }}>
            Select a location or navigate through the map
          </TText>
          <LocationAutocomplete
            value={locationName}
            onSelect={handleLocationSelect}
            placeholder="Search for a location or move the map"
          />
          <TText style={{ fontSize: 11, opacity: 0.5, marginTop: 8 }}>
            Move the map to pin a location
          </TText>
        </LinearGradient>

        {/* Bottom overlay */}
        <LinearGradient
          colors={['transparent', '#000']}
          style={styles.bottomContainer}
        >
          <View style={{ width: '80%' }}>
            <TText type="subtitle" style={{ color: '#fff' }}>
              {isLoadingLocation ? 'Getting location...' : locationName}
            </TText>
            <TText style={{ color: '#fff' }}>{locationData.address?.city}</TText>
            {weatherCity ? (
              <WeatherDisplay
                heatValue={weather?.temperature ?? undefined}
                rainValue={weather?.precipitation ?? undefined}
                humidValue={weather?.humidity ?? undefined}
                windValue={weather?.windSpeed ?? undefined}
                loading={weatherLoading || isLoadingLocation}
                textColor="#fff"
                backgroundColor="#0004"
              />
            ) : null}
          </View>
          <RoundButton iconName="check" onPress={handleConfirm} />
        </LinearGradient>
      </TView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  topSection: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 100,
  },
});