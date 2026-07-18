import 'dotenv/config';
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Tarahive',
  slug: 'tarahive-mobile',
  scheme: 'tarahiveapp',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',

  splash: {
    image: './assets/images/icon.png',
    resizeMode: 'contain',
    backgroundColor: '#FFD65A',
  },

  plugins: ['expo-router'],

  // Example of exposing values to your app (optional)
  extra: {
    apiUrl: process.env.API_URL,
    mapTilerKey: process.env.MAPTILER_KEY,
  },

  // Example of using env vars for native config (optional)
  // android: {
  //   package: 'com.tarahive.app',
  //   config: {
  //     googleMaps: {
  //       apiKey: process.env.GOOGLE_MAPS_API_KEY,
  //     },
  //   },
  // },

  // ios: {
  //   bundleIdentifier: 'com.tarahive.app',
  //   config: {
  //     googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  //   },
  // },
};

export default config;