import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TText, TView, TIcon } from '@/shared/components/ui/Themed';
import { useLocation } from '@/shared/context/DeviceContext';
import { useCurrentWeather } from '@/shared/hooks/useWeather';
import Skeleton from '@/shared/components/ui/Skeleton';

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

export default function WeatherCard() {
  const locationData = useLocation();

  const displayCity = locationData.city || locationData.suburb || locationData.region || locationData.state || 'Your Location';
  const { data: displayWeather, isLoading, error } = useCurrentWeather(
    locationData.latitude,
    locationData.longitude,
    displayCity
  );

  const showLoading = isLoading || (locationData.loading && !displayWeather);

  if (showLoading) {
    return (
      <TView color='primary' style={[styles.locationContent, { height: 185 }]}>
        <Skeleton style={styles.descLoading}/>
        <Skeleton style={styles.locationLoading}/>
        <Skeleton style={styles.weatherTypeLoading}/>

        <View style={styles.weatherDetailsContainer}>
          <View style={styles.weather}>
            <Skeleton style={styles.weatherIconLoading}/>
            <Skeleton style={styles.weatherValueLoading}/>
            <Skeleton style={styles.weatherLabelLoading}/>
          </View>
          <View style={styles.weather}>
            <Skeleton style={styles.weatherIconLoading}/>
            <Skeleton style={styles.weatherValueLoading}/>
            <Skeleton style={styles.weatherLabelLoading}/>
          </View>
          <View style={styles.weather}>
            <Skeleton style={styles.weatherIconLoading}/>
            <Skeleton style={styles.weatherValueLoading}/>
            <Skeleton style={styles.weatherLabelLoading}/>
          </View>
          <View style={styles.weather}>
            <Skeleton style={styles.weatherIconLoading}/>
            <Skeleton style={styles.weatherValueLoading}/>
            <Skeleton style={styles.weatherLabelLoading}/>
          </View>
        </View>
      </TView>
    );
  }

  return (
    <TView color='primary' style={styles.locationContent}>
      <View style={{ gap: 3}}>
        <TText style={{ opacity: 0.5, fontSize: 12 }}>
          You're currently at
        </TText>
        <TText type='subtitle' style={{ fontSize: 16 }}>
          {displayCity}
        </TText>
        
        <TText style={{ opacity: 0.5, fontSize: 12 }}>
          {displayWeather?.weatherType || 'No data'}
        </TText>

        {displayWeather && (
          <Image
            source={getWeatherImage(displayWeather.weatherCode)}
            style={styles.weatherImage}
            resizeMode="contain"
          />
        )}
        
        <View style={styles.weatherDetailsContainer}>
          <View style={styles.weather}>
            <TIcon name='thermometer' size={20} color='#B36B6B' />
            <TText style={{ marginTop: 5 }}>
              {displayWeather?.temperature !== null && displayWeather?.temperature !== undefined
                ? `${Math.round(displayWeather.temperature)}°C`
                : 'N/A'}
            </TText>
            <TText style={styles.weatherLabel}>Heat</TText>
          </View>
          <View style={styles.weather}>
            <TIcon name='cloud' size={20} color='#5A7D9A' />
            <TText style={{ marginTop: 5 }}>
              {displayWeather?.precipitation !== null && displayWeather?.precipitation !== undefined
                ? `${displayWeather.precipitation}mm`
                : 'N/A'}
            </TText>
            <TText style={styles.weatherLabel}>Rain</TText>
          </View>
          <View style={styles.weather}>
            <TIcon name='water' size={20} color='#5A7D9A' />
            <TText style={{ marginTop: 5 }}>
              {displayWeather?.humidity !== null && displayWeather?.humidity !== undefined
                ? `${displayWeather.humidity.toFixed(0)}%`
                : 'N/A'}
            </TText>
            <TText style={styles.weatherLabel}>Humid</TText>
          </View>
          <View style={styles.weather}>
            <TIcon name='fan' size={20} color='#5A7D9A' />
            <TText style={{ marginTop: 5 }}>
              {displayWeather?.windSpeed !== null && displayWeather?.windSpeed !== undefined
                ? `${Math.round(displayWeather.windSpeed)}km/h`
                : 'N/A'}
            </TText>
            <TText style={styles.weatherLabel}>Wind</TText>
          </View>
        </View>

        {error && (
          <TText style={{ opacity: 0.5, marginTop: 10, textAlign: 'center', fontSize: 12, color: '#ff6b6b' }}>
            {error instanceof Error ? error.message : 'Failed to load weather data'}
          </TText>
        )}
      </View>
    </TView>
  );
}

const styles = StyleSheet.create({
  locationContent: {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  weatherDetailsContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginTop: 35,
  },
  weather: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '23%',
  },
  weatherLabel: {
    fontSize: 9,
    opacity: 0.5,
    marginTop: 5,
  },
  weatherImage: {
    position: 'absolute',
    top: '-15%',
    right: '-30%',
    width: '75%',
    height: '75%',
    zIndex: 1000,
  },
  weatherValueLoading: {
    width: 50,
    height: 15,
    borderRadius: 100,
    marginVertical: 5,
    overflow: 'hidden',
  },
  weatherLabelLoading: {
    width: 50,
    height: 10,
    borderRadius: 100,
    marginVertical: 1,
    overflow: 'hidden',
  },
  weatherIconLoading: {
    width: 30,
    height: 20,
    borderRadius: 100,
    marginVertical: 1,
    overflow: 'hidden',
  },
  weatherTypeLoading: {
    width: 70,
    height: 15,
    borderRadius: 100,
    marginVertical: 5,
    overflow: 'hidden',
  },
  descLoading: {
    width: 70,
    height: 15,
    borderRadius: 100,
    marginBottom: 5,
    overflow: 'hidden',
  },
  locationLoading: {
    width: 200,
    height: 20,
    marginVertical:3,
    borderRadius: 100,
    overflow: 'hidden',
  },
});