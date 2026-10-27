import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL } from '@/constants/Config';

const API_URL = `${BACKEND_URL}/v2/weather`;

const weatherCodeKeyMap: Record<number, string> = {
  0:  'common.weather.clear_sky',
  1:  'common.weather.mainly_clear',
  2:  'common.weather.partly_cloudy',
  3:  'common.weather.cloudy',
  45: 'common.weather.fog',
  48: 'common.weather.depositing_rime_fog',
  51: 'common.weather.light_drizzle',
  53: 'common.weather.moderate_drizzle',
  55: 'common.weather.heavy_drizzle',
  56: 'common.weather.light_freezing_drizzle',
  57: 'common.weather.heavy_freezing_drizzle',
  61: 'common.weather.slight_rain',
  63: 'common.weather.moderate_rain',
  65: 'common.weather.heavy_rain',
  66: 'common.weather.light_freezing_rain',
  67: 'common.weather.heavy_freezing_rain',
  71: 'common.weather.slight_snow_fall',
  73: 'common.weather.moderate_snow_fall',
  75: 'common.weather.heavy_snow_fall',
  77: 'common.weather.snow_grains',
  80: 'common.weather.slight_rain_showers',
  81: 'common.weather.moderate_rain_showers',
  82: 'common.weather.violent_rain_showers',
  85: 'common.weather.slight_snow_showers',
  86: 'common.weather.heavy_snow_showers',
  95: 'common.weather.thunderstorm',
  96: 'common.weather.thunderstorm_slight_hail',
  99: 'common.weather.thunderstorm_heavy_hail',
};

export interface WeatherData {
  temperature: number | null;
  precipitation: number | null;
  humidity: number | null;
  windSpeed: number | null;
  weatherType: string;
  weatherCode: number;
}

const getWeatherTypeFromCode = (weatherCode: number | null | undefined): string | null => {
  if (typeof weatherCode !== 'number') {
    return null;
  }

  return weatherCodeKeyMap[weatherCode] ?? null;
};

const normalizeWeatherData = (responseData: any): WeatherData => {
  const weatherPayload = responseData?.data ?? responseData;
  const weatherCode = typeof weatherPayload?.weatherCode === 'number'
    ? weatherPayload.weatherCode
    : null;

  return {
    temperature: weatherPayload?.temperature ?? null,
    precipitation: weatherPayload?.precipitation ?? null,
    humidity: weatherPayload?.humidity ?? null,
    windSpeed: weatherPayload?.windSpeed ?? null,
    weatherCode: weatherCode ?? 0,
    weatherType:
      weatherPayload?.weatherType && typeof weatherPayload.weatherType === 'string'
        ? weatherPayload.weatherType
        : getWeatherTypeFromCode(weatherCode) ?? 'common.weather.clear_sky',
  };
};

const getSuggestion = (
  weatherCode: number,
  temperature: number,
  humidity: number,
  wind: number,
  precipitation: number,
  t: (key: string) => string,
) => {
  // Rain / precipitation
  if (precipitation >= 10) {
    return t("weather.suggestions.rain");
  }

  // Thunderstorm
  if ([95, 96, 99].includes(weatherCode)) {
    return t("weather.suggestions.thunderstorm");
  }

  // Very hot and humid
  if (temperature >= 32 && humidity >= 70) {
    return t("weather.suggestions.hotHumid");
  }

  // Very hot
  if (temperature >= 35) {
    return t("weather.suggestions.veryHot");
  }

  // Strong wind
  if (wind >= 30) {
    return t("weather.suggestions.strongWind");
  }

  // Cold
  if (temperature <= 18) {
    return t("weather.suggestions.cold");
  }

  // Cloudy / overcast
  if ([1, 2, 3].includes(weatherCode)) {
    return t("weather.suggestions.cloudy");
  }

  // Default
  return t("weather.suggestions.pleasant");
};

const fetchWeather = async (
  city: string,
  latitude: number,
  longitude: number,
): Promise<WeatherData> => {
  const queryParams = new URLSearchParams({
    city,
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  });

  const response = await fetch(`${API_URL}?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const responseData = await response.json();
  return normalizeWeatherData(responseData);
};

/**
 * Calculate milliseconds until midnight
 */
const getTimeUntilMidnight = (): number => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Math.max(tomorrow.getTime() - now.getTime(), 0);
};

/**
 * Hook to get weather for the current user location
 * Caches until midnight and refreshes on a new day
 */
export const useCurrentWeather = (
  latitude: number | undefined,
  longitude: number | undefined,
  city: string
) => {
  const timeUntilMidnight = getTimeUntilMidnight();

  return useQuery<WeatherData>({
    queryKey: ['weather', 'current', latitude, longitude],
    queryFn: () => fetchWeather(city, latitude!, longitude!),
    enabled: latitude !== undefined && longitude !== undefined && city.length > 0,
    staleTime: timeUntilMidnight,
    refetchInterval: timeUntilMidnight,
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
  });
};

/**
 * Hook to get weather for a specific chosen location
 * 10 minute stale time, 30 minute cache time
 */
export const usePlaceWeather = (
  latitude: number | undefined,
  longitude: number | undefined,
  city: string
) => {
  return useQuery<WeatherData>({
    queryKey: ['weather', 'place', latitude, longitude, city],
    queryFn: () => fetchWeather(city, latitude!, longitude!),
    enabled: latitude !== undefined && longitude !== undefined && city.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};