import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { Platform, View } from 'react-native';

type Props = {
  latitude?: number;
  longitude?: number;
  onRegionChange?: (latitude: number, longitude: number) => void;
  showMarker?: boolean;
  showCenterMarker?: boolean;
  zoom?: number;
};

type LeafletMap = {
  getCenter: () => { lat: number; lng: number };
  setView: (center: [number, number], zoom: number, options?: { animate?: boolean }) => void;
};

export type OSMMapViewRef = {
  setCenter: (latitude: number, longitude: number) => void;
};

type MapEventsProps = {
  onRegionChange?: Props['onRegionChange'];
  onMapReady: (map: LeafletMap | null) => void;
};

function MapEvents({ onRegionChange, onMapReady }: MapEventsProps) {
  const { useMapEvents } = require('react-leaflet');
  const map: LeafletMap = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onRegionChange?.(center.lat, center.lng);
    },
  });

  useEffect(() => {
    onMapReady(map);
    return () => onMapReady(null);
  }, [map, onMapReady]);

  return null;
}

const OSMMapView = React.forwardRef<OSMMapViewRef, Props>(function OSMMapView({
  latitude = 0,
  longitude = 0,
  onRegionChange,
  showMarker = true,
  showCenterMarker = false,
  zoom = 15,
}, ref) {
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const webViewRef = useRef<any>(null);
  const handleMapReady = useCallback((map: LeafletMap | null) => {
    leafletMapRef.current = map;
  }, []);

  useImperativeHandle(ref, () => ({
    setCenter: (nextLatitude, nextLongitude) => {
      if (Platform.OS === 'web') {
        leafletMapRef.current?.setView([nextLatitude, nextLongitude], zoom, { animate: true });
      } else {
        webViewRef.current?.injectJavaScript(
          `window.map.setView([${nextLatitude}, ${nextLongitude}], ${zoom}, { animate: true }); true;`
        );
      }
    },
  }), [zoom]);

  if (Platform.OS === 'web') {
    const { MapContainer, TileLayer, Marker } = require('react-leaflet');

    return (
      <View style={{ width: '100%', height: '100%', position: 'relative' }}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={zoom}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
        >
          <MapEvents onRegionChange={onRegionChange} onMapReady={handleMapReady} />
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {showMarker ? <Marker position={[latitude, longitude]} /> : null}
        </MapContainer>
        {showCenterMarker ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: '#00CAFF',
                borderWidth: 3,
                borderColor: '#fff',
              }}
            />
          </View>
        ) : null}
      </View>
    );
  }

  const { WebView } = require('react-native-webview');

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>

<style>
html, body, #map {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
${showCenterMarker ? `#center-marker {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  transform: translate(-50%, -50%);
  border: 3px solid #fff;
  border-radius: 50%;
  background: #00CAFF;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 1000;
}` : ''}
</style>
</head>

<body>
<div id="map"></div>
${showCenterMarker ? '<div id="center-marker"></div>' : ''}

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>
window.map = L.map('map', {
  zoomControl: false
}).setView([${latitude}, ${longitude}], ${zoom});

L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }
).addTo(window.map);

${showMarker ? `L.marker([${latitude}, ${longitude}]).addTo(window.map);` : ''}

let debounceTimer = null;
window.map.on('moveend', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const center = window.map.getCenter();
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

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ html }}
      style={{ flex: 1 }}
      onMessage={(event: { nativeEvent: { data: string } }) => {
        try {
          const message = JSON.parse(event.nativeEvent.data);
          if (message.type === 'regionChange') {
            onRegionChange?.(message.latitude, message.longitude);
          }
        } catch {}
      }}
    />
  );
});

export default OSMMapView;