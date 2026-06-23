import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TText, TIcon } from '@/shared/components/ui/Themed';
import { useLocation } from '@/shared/context/LocationContext';
import { useCurrentWeather, type WeatherData } from '@/shared/hooks/useWeather';
import Skeleton from '@/shared/components/ui/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import HiveBg from '../common/HiveBg';
import WeatherDisplay from '../common/WeatherDisplay';

const getWeatherImage = (weatherCode: number): any => {
  if (weatherCode === 0) {
    return require('@/shared/assets/images/weather-sunny-min.png');
  } else if (weatherCode === 1 || weatherCode === 2) {
    return require('@/shared/assets/images/weather-cloudy-min.png');
  } else if (weatherCode === 3 || weatherCode === 45 || weatherCode === 48) {
    return require('@/shared/assets/images/weather-cloudy-min.png');
  } else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return require('@/shared/assets/images/weather-rainy-min.png');
  } else if (weatherCode >= 71 && weatherCode <= 77) {
    return require('@/shared/assets/images/weather-rainy-min.png');
  } else if (weatherCode >= 85 && weatherCode <= 86) {
    return require('@/shared/assets/images/weather-rainy-min.png');
  } else if (weatherCode >= 95 && weatherCode <= 99) {
    return require('@/shared/assets/images/weather-rainy-min.png');
  }
  return require('@/shared/assets/images/weather-sunny-min.png');
};

export default function HomeHeaderCard() {
  const locationData = useLocation();
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');

  const displayCity = locationData.city || locationData.suburb || locationData.region || locationData.state || 'Your Location';
  const query = useCurrentWeather(
    locationData.latitude,
    locationData.longitude,
    displayCity
  );
  const displayWeather = query.data as WeatherData | undefined;
  const isLoading = query.isLoading;

  const showLoading = isLoading || (locationData.loading && !displayWeather);

  return (
    <LinearGradient colors={[accentColor, secondaryColor]} style={styles.locationContent}>
      <HiveBg flipHorizontal blur={false} />
      <HiveBg blur={false} />
      <View style={{ gap: 5 }}>
        {showLoading ? <>
          <Skeleton style={styles.descLoading} />
          <Skeleton style={styles.locationLoading} />
          <Skeleton style={styles.weatherTypeLoading} />
        </> :
          <>
            <TText style={{ opacity: 0.5, fontSize: 12 }}>
              You're currently at
            </TText>
            <TText type='subtitle' style={{ color: '#fff', fontSize: 17 }}>
              {displayCity}
            </TText>

            <TText style={{ opacity: 0.5, fontSize: 12 }}>
              {displayWeather?.weatherType || 'No data'}
            </TText>
          </>
        }


        {displayWeather && !showLoading && (
          <Image
            source={getWeatherImage(displayWeather.weatherCode)}
            style={styles.weatherImage}
            resizeMode='cover'
          />
        )}

        <View style={{marginTop: 25}}>
          <WeatherDisplay
            heatValue={displayWeather?.temperature || 0}
            rainValue={displayWeather?.precipitation || 0}
            humidValue={displayWeather?.humidity || 0}
            windValue={displayWeather?.windSpeed || 0}
            loading={showLoading}
          />
        </View>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  locationContent: {
    width: '100%',
    padding: 16,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 300,
  },
  weatherImage: {
    position: 'absolute',
    top: '-13%',
    right: '-15%',
    width: '40%',
    height: '75%',
    zIndex: 1000,
  },
  weatherTypeLoading: {
    width: 70,
    height: 15,
    borderRadius: 100,
    overflow: 'hidden',
  },
  descLoading: {
    width: 70,
    height: 15,
    borderRadius: 100,
    overflow: 'hidden',
  },
  locationLoading: {
    width: 200,
    height: 20,
    borderRadius: 100,
    overflow: 'hidden',
  },
});