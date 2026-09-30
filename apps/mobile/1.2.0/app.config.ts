import 'dotenv/config';

import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Tarahive',
  slug: 'tarahive-mobile',
  scheme: 'tarahiveapp',
  version: '1.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',

  splash: {
    image: './assets/images/icon.png',
    resizeMode: 'contain',
    backgroundColor: '#FF6B6B',
  },

  plugins: [
    'expo-router',
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: process.env.ADMOB_ANDROID_APP_ID,
        iosAppId: process.env.ADMOB_IOS_APP_ID,
      },
    ],
  ],

  extra: {
    apiUrl: process.env.API_URL,
    mapTilerKey: process.env.MAPTILER_KEY,
  },
};

export default config;