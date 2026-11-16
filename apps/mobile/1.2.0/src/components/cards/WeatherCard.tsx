import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TText, TIcon, TView } from '@/components/ui/Themed';
import { useLocation } from '@/context/LocationContext';
import { useCurrentWeather, type WeatherData } from '@/hooks/shared/useWeather';
import Skeleton from '@/components/ui/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/shared/useThemeColor';
import WeatherDisplay from '../common/WeatherDisplay';
import { useLanguage } from '@/context/LanguageContext';

const getWeatherImage = (weatherCode: number): any => {
  if (weatherCode === 0) {
    return require('../../../assets/images/weather-sunny-min.png');
  } else if (weatherCode === 1 || weatherCode === 2) {
    return require('../../../assets/images/weather-cloudy-min.png');
  } else if (weatherCode === 3 || weatherCode === 45 || weatherCode === 48) {
    return require('../../../assets/images/weather-cloudy-min.png');
  } else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return require('../../../assets/images/weather-rainy-min.png');
  } else if (weatherCode >= 71 && weatherCode <= 77) {
    return require('../../../assets/images/weather-rainy-min.png');
  } else if (weatherCode >= 85 && weatherCode <= 86) {
    return require('../../../assets/images/weather-rainy-min.png');
  } else if (weatherCode >= 95 && weatherCode <= 99) {
    return require('../../../assets/images/weather-rainy-min.png');
  }
  return require('../../../assets/images/weather-sunny-min.png');
};

export default function WeatherCard() {
  const { t } = useLanguage();
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
    <TView style={[styles.locationContent, {backgroundColor: accentColor + '20'}]}>
      <View style={{ gap: 4, paddingTop: 17 }}>
        {showLoading ? <>
          <Skeleton style={styles.locationLoading} />
          <Skeleton style={styles.weatherTypeLoading} />
        </> :
          <>
            <TText type='title' style={{ fontSize: 17, lineHeight: 20, letterSpacing: 1 }}>
              {displayCity}
            </TText>

            <TText style={{ opacity: 0.5, fontSize: 12}}>
              {t(displayWeather?.weatherType || 'No data')}
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

        <View style={{marginTop: 10}}>
          <WeatherDisplay
            heatValue={displayWeather?.temperature || 0}
            rainValue={displayWeather?.precipitation || 0}
            humidValue={displayWeather?.humidity || 0}
            windValue={displayWeather?.windSpeed || 0}
            loading={showLoading}
          />
        </View>

      </View>
    </TView>
  );
}

const styles = StyleSheet.create({
  locationContent: {
    padding: 16,
    overflow: 'hidden',
    marginBottom: 15,
    marginHorizontal: '3%',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 20
  },
  weatherImage: {
    position: 'absolute',
    top: '-15%',
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