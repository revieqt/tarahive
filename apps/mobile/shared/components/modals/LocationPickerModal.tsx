import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { TView, TText } from '@/shared/components/ui/Themed';
import TextField from '@/shared/components/ui/TextField';
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
  onAddLocation: (location: LocationItemWithAddress, note: string) => void;
  isEditingLocation?: boolean;
  initialLocation?: LocationItemWithAddress;
}

// Generates the full Leaflet HTML page injected into WebView
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
          const map = L.map('map', {
            center: [${lat}, ${lng}],
            zoom: 16,
            zoomControl: true,
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map);

          // Throttle moveend events to avoid flooding RN bridge
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

  const [step, setStep] = useState<1 | 2>(1);
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [modalLocationName, setModalLocationName] = useState('');
  const [modalNote, setModalNote] = useState('');
  const [modalLocationData, setModalLocationData] = useState<Partial<LocationItemWithAddress>>({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [leafletHTML, setLeafletHTML] = useState('');

  const webViewRef = useRef<WebView>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const parseAddressFromNominatim = (addressData: any): Address => ({
    country: addressData.address?.country,
    region: addressData.address?.state,
    province: addressData.address?.county,
    city: addressData.address?.city ?? addressData.address?.town ?? addressData.address?.village,
    district: addressData.address?.district ?? addressData.address?.suburb,
    neighborhood: addressData.address?.neighbourhood ?? addressData.address?.neighborhood,
    postal_code: addressData.address?.postcode,
  });

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setIsLoadingLocation(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'TaraG/1.0' } }
      );
      const data = await res.json();
      const address = parseAddressFromNominatim(data);
      const locationName = (data.display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        .split(',')[0]
        .trim();
      return { locationName, address };
    } catch {
      return { locationName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, address: {} };
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // ─── Pan map to coordinates (called when autocomplete picks a location) ─────

  const panMapTo = (lat: number, lng: number) => {
    webViewRef.current?.injectJavaScript(`
      map.setView([${lat}, ${lng}], 16, { animate: true });
      true; // required by some WebView implementations
    `);
  };

  // ─── Initialise on open ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!visible) return;

    setStep(1);

    let initLat: number;
    let initLng: number;

    if (isEditingLocation && initialLocation?.latitude && initialLocation?.longitude) {
      initLat = initialLocation.latitude;
      initLng = initialLocation.longitude;
      setModalLocationName(initialLocation.locationName ?? '');
      setModalNote(initialLocation.note ?? '');
      setModalLocationData(initialLocation);
    } else {
      initLat = latitude ?? 10.3157; // fallback: Cebu City
      initLng = longitude ?? 123.8854;
      setModalLocationName('');
      setModalNote('');
      setModalLocationData({});
    }

    setCenterCoords({ lat: initLat, lng: initLng });
    setLeafletHTML(buildLeafletHTML(initLat, initLng));

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [visible, isEditingLocation, initialLocation, latitude, longitude]);

  // ─── Messages from WebView (map moved) ───────────────────────────────────────

  const handleWebViewMessage = async (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type !== 'regionChange') return;

      const { latitude: lat, longitude: lng } = msg;
      setCenterCoords({ lat, lng });

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        const { locationName, address } = await reverseGeocode(lat, lng);
        setModalLocationName(locationName);
        setModalLocationData({ locationName, latitude: lat, longitude: lng, address });
      }, 0); // debounce already handled inside the HTML; fire immediately here
    } catch {
      // ignore malformed messages
    }
  };

  // ─── Autocomplete selection ───────────────────────────────────────────────────

  const handleLocationSelect = async (loc: LocationItem) => {
    setModalLocationName(loc.locationName ?? '');
    
    // If location doesn't have address, fetch it via reverse geocoding
    if (loc.latitude && loc.longitude && (!loc.address || Object.keys(loc.address).length === 0)) {
      const { address } = await reverseGeocode(loc.latitude, loc.longitude);
      setModalLocationData({ ...loc, address });
    } else {
      setModalLocationData(loc);
    }
    
    if (loc.latitude && loc.longitude) {
      panMapTo(loc.latitude, loc.longitude);
    }
  };

  // ─── Step navigation ──────────────────────────────────────────────────────────

  const handleNextStep = () => {
    if (
      modalLocationData.locationName &&
      modalLocationData.latitude &&
      modalLocationData.longitude
    ) {
      setStep(2);
    }
  };

  const handleBackStep = () => setStep(1);

  const handleAddLocation = () => {
    if (
      modalLocationData.locationName &&
      modalLocationData.latitude &&
      modalLocationData.longitude &&
      modalLocationData.address
    ) {
      const locationToAdd: LocationItemWithAddress = {
        ...modalLocationData,
        note: modalNote ?? '',
        address: modalLocationData.address ?? {},
      } as LocationItemWithAddress;
      onAddLocation(locationToAdd, modalNote);
      onClose();
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1 }}>
        <TView style={{ flex: 1 }}>

          {/* Leaflet map in a WebView */}
          {leafletHTML ? (
            <View style={styles.mapContainer}>
              <WebView
                ref={webViewRef}
                style={styles.map}
                originWhitelist={['*']}
                source={{ html: leafletHTML }}
                onMessage={handleWebViewMessage}
                scrollEnabled={false}
                // Disable interaction on step 2 so user can't accidentally move the map
                pointerEvents={step === 1 ? 'auto' : 'none'}
                javaScriptEnabled
              />
              {/* Fixed crosshair in the centre */}
              <View style={styles.centerMarkerContainer} pointerEvents="none">
                <View style={styles.centerMarker} />
              </View>
            </View>
          ) : null}

          {/* Top overlay */}
          <LinearGradient colors={['#000', 'transparent']} style={styles.topSection}>
            <TText style={{ marginBottom: 8, color: '#fff' }}>
              {step === 1
                ? 'Select a location or navigate through the map'
                : 'Add a note (optional)'}
            </TText>

            {step === 1 ? (
              <>
                <LocationAutocomplete
                  value={modalLocationName}
                  onSelect={handleLocationSelect}
                  placeholder="Search for a location or move the map"
                />
                <TText style={{ fontSize: 11, opacity: 0.5, marginTop: 8 }}>
                  Move the map to select a location
                </TText>
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

          {/* Bottom overlay */}
          <LinearGradient
            colors={['transparent', '#000']}
            style={styles.bottomButtonContainer}
          >
            {step === 2 ? (
              <>
                <RoundButton
                  iconName="arrow-left"
                  onPress={handleBackStep}
                  style={{ backgroundColor: 'gray' }}
                />
                <RoundButton iconName="check" onPress={handleAddLocation} />
              </>
            ) : (
              <>
                <View style={{ width: '80%' }}>
                  <TText type="subtitle" style={{ color: '#fff' }}>
                    {isLoadingLocation ? 'Getting location...' : modalLocationName}
                  </TText>
                  <TText style={{ color: '#fff' }}>Your Chosen Location</TText>
                </View>
                <RoundButton iconName="arrow-right" onPress={handleNextStep} />
              </>
            )}
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