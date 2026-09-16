import React from 'react';
import { Platform } from 'react-native';

type Props = {
  latitude?: number;
  longitude?: number;
};

export default function OSMMapView({
  latitude = 0,
  longitude = 0,
}: Props) {
  if (Platform.OS === 'web') {
    const { MapContainer, TileLayer, Marker } = require('react-leaflet');

    return (
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={[latitude, longitude]} />
      </MapContainer>
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
</style>
</head>

<body>
<div id="map"></div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>
const map = L.map('map', {
  zoomControl: false
}).setView([${latitude}, ${longitude}], 15);

L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }
).addTo(map);

L.marker([${latitude}, ${longitude}]).addTo(map);
</script>

</body>
</html>
`;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      style={{ flex: 1 }}
    />
  );
}