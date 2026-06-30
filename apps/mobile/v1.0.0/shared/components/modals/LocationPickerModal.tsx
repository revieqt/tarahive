import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { TView, TText } from '@/shared/components/ui/Themed';
import LocationAutocomplete, { LocationItem } from '@/shared/components/ui/LocationField';
import RoundButton from '@/shared/components/ui/RoundButton';
import { useLocation } from '@/shared/context/LocationContext';

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

function buildLeafletHTML(lat: number, lng: number): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body, #map { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { center: [${lat}, ${lng}], zoom: 16, zoomControl: true });
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map);
          let debounceTimer = null;
          map.on('moveend', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              const center = map.getCenter();
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'regionChange',
                latitude: center.lat,
                longitude: center.lng,
              }));
            }, 500);
          });
        </script>
      </body>
    </html>
  `;
}

export default function LocationPickerModal({
  visible,
  onClose,
  onAddLocation,
  isEditingLocation = false,
  initialLocation,
}: LocationPickerModalProps) {
  const { latitude, longitude } = useLocation();

  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  const [locationData, setLocationData] = useState<Partial<LocationItemWithAddress>>({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [leafletHTML, setLeafletHTML] = useState('');

  const webViewRef = useRef<WebView>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    webViewRef.current?.injectJavaScript(
      `map.setView([${lat}, ${lng}], 16, { animate: true }); true;`
    );
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
    setLeafletHTML(buildLeafletHTML(initLat, initLng));

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [visible, isEditingLocation, initialLocation, latitude, longitude]);

  // ── WebView messages ───────────────────────────────────────────────────────

  const handleWebViewMessage = async (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type !== 'regionChange') return;
      const { latitude: lat, longitude: lng } = msg;
      setCenterCoords({ lat, lng });
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        const { name, address } = await reverseGeocode(lat, lng);
        setLocationName(name);
        setLocationData({ locationName: name, latitude: lat, longitude: lng, address });
      }, 0);
    } catch {}
  };

  // ── Autocomplete selection ─────────────────────────────────────────────────

  const handleLocationSelect = async (loc: LocationItem) => {
    setLocationName(loc.locationName ?? '');
    if (loc.latitude && loc.longitude && (!loc.address || Object.keys(loc.address).length === 0)) {
      const { address } = await reverseGeocode(loc.latitude, loc.longitude);
      setLocationData({ ...loc, address });
    } else {
      setLocationData(loc);
    }
    if (loc.latitude && loc.longitude) panMapTo(loc.latitude, loc.longitude);
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
      <SafeAreaView style={{ flex: 1 }}>
        <TView style={{ flex: 1 }}>
          {leafletHTML ? (
            <View style={styles.mapContainer}>
              <WebView
                ref={webViewRef}
                style={styles.map}
                originWhitelist={['*']}
                source={{ html: leafletHTML }}
                onMessage={handleWebViewMessage}
                scrollEnabled={false}
                javaScriptEnabled
              />
              <View style={styles.centerMarkerContainer} pointerEvents="none">
                <View style={styles.centerMarker} />
              </View>
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
              <TText style={{ color: '#fff' }}>Your Chosen Location</TText>
            </View>
            <RoundButton iconName="check" onPress={handleConfirm} />
          </LinearGradient>
        </TView>
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
    top: 0, bottom: 0, left: 0, right: 0,
  },
  topSection: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
  },
  centerMarkerContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
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