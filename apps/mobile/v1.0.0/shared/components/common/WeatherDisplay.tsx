import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '@/shared/hooks/useThemeColor';
import { TIcon, TText } from '../ui/Themed';
import Skeleton from '../ui/Skeleton';

interface WeatherDisplayProps {
  heatValue?: number;
  rainValue?: number;
  humidValue?: number;
  windValue?: number;
  loading?: boolean;
  textColor?: string;
  backgroundColor?: string;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({
  heatValue,
  rainValue,
  humidValue,
  windValue,
  loading = false,
  textColor,
  backgroundColor
}) => {
  const color = textColor || useThemeColor({}, 'text');

  if (loading) {
    return (
      <View style={styles.weatherDetailsContainer}>
        <View style={styles.weather}>
          { backgroundColor && <Skeleton style={styles.weatherLoading}/>}
          <Skeleton style={styles.weatherIconLoading} />
          <Skeleton style={styles.weatherValueLoading} />
          <Skeleton style={styles.weatherLabelLoading} />
        </View>
        <View style={styles.weather}>
          { backgroundColor && <Skeleton style={styles.weatherLoading}/>}
          <Skeleton style={styles.weatherIconLoading} />
          <Skeleton style={styles.weatherValueLoading} />
          <Skeleton style={styles.weatherLabelLoading} />
        </View>
        <View style={styles.weather}>
          { backgroundColor && <Skeleton style={styles.weatherLoading}/>}
          <Skeleton style={styles.weatherIconLoading} />
          <Skeleton style={styles.weatherValueLoading} />
          <Skeleton style={styles.weatherLabelLoading} />
        </View>
        <View style={styles.weather}>
          { backgroundColor && <Skeleton style={styles.weatherLoading}/>}
          <Skeleton style={styles.weatherIconLoading} />
          <Skeleton style={styles.weatherValueLoading} />
          <Skeleton style={styles.weatherLabelLoading} />
        </View>
      </View>
    )

  }

  return (
    <View style={[styles.container, {}]}>
      <View style={styles.weatherDetailsContainer}>
        <View style={[styles.weather, { backgroundColor: backgroundColor }]}>
          <TIcon name='thermometer' size={20} color="#B36B6B" />
          <TText style={[styles.weatherValue, { color }]}>
            {heatValue !== null && heatValue !== undefined
              ? `${Math.round(heatValue)}°C`
              : 'N/A'}
          </TText>
          <TText style={[styles.weatherLabel, { color }]}>Heat</TText>
        </View>
        <View style={[styles.weather, { backgroundColor: backgroundColor }]}>
          <TIcon name='cloud' size={20} color="#5A7D9A" />
          <TText style={[styles.weatherValue, { color }]}>
            {rainValue !== null && rainValue !== undefined
              ? `${rainValue}mm`
              : 'N/A'}
          </TText>
          <TText style={[styles.weatherLabel, { color }]}>Rain</TText>
        </View>
        <View style={[styles.weather, { backgroundColor: backgroundColor }]}>
          <TIcon name='water' size={20} color="#5A7D9A" />
          <TText style={[styles.weatherValue, { color }]}>
            {humidValue !== null && humidValue !== undefined
              ? `${humidValue.toFixed(0)}%`
              : 'N/A'}
          </TText>
          <TText style={[styles.weatherLabel, { color }]}>Humid</TText>
        </View>
        <View style={[styles.weather, { backgroundColor: backgroundColor }]}>
          <TIcon name='fan' size={20} color="#5A7D9A" />
          <TText style={[styles.weatherValue, { color }]}>
            {windValue !== null && windValue !== undefined
              ? `${Math.round(windValue)}km/h`
              : 'N/A'}
          </TText>
          <TText style={[styles.weatherLabel, { color }]}>Wind</TText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  weatherDetailsContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  weather: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    height: 75,
    borderRadius: 10,
  },
  weatherValue: {
    marginTop: 5,
  },
  weatherLabel: {
    fontSize: 9,
    opacity: 0.5,
    marginTop: 5,
  },
  weatherLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 75,
    borderRadius: 10,
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
});

export default WeatherDisplay; 