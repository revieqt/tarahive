import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL } from '@/Config';

const API_URL = `${BACKEND_URL}/v1/weather`;

const weatherCodeKeyMap: Record<number, string> = {  // 2. rename map + swap values to keys
  0:  'common.conditions.clear_sky',
  1:  'common.conditions.mainly_clear',
  2:  'common.conditions.partly_cloudy',
  3:  'common.conditions.cloudy',
  45: 'common.conditions.fog',
  48: 'common.conditions.depositing_rime_fog',
  51: 'common.conditions.light_drizzle',
  53: 'common.conditions.moderate_drizzle',
  55: 'common.conditions.heavy_drizzle',
  56: 'common.conditions.light_freezing_drizzle',
  57: 'common.conditions.heavy_freezing_drizzle',
  61: 'common.conditions.slight_rain',
  63: 'common.conditions.moderate_rain',
  65: 'common.conditions.heavy_rain',
  66: 'common.conditions.light_freezing_rain',
  67: 'common.conditions.heavy_freezing_rain',
  71: 'common.conditions.slight_snow_fall',
  73: 'common.conditions.moderate_snow_fall',
  75: 'common.conditions.heavy_snow_fall',
  77: 'common.conditions.snow_grains',
  80: 'common.conditions.slight_rain_showers',
  81: 'common.conditions.moderate_rain_showers',
  82: 'common.conditions.violent_rain_showers',
  85: 'common.conditions.slight_snow_showers',
  86: 'common.conditions.heavy_snow_showers',
  95: 'common.conditions.thunderstorm',
  96: 'common.conditions.thunderstorm_slight_hail',
  99: 'common.conditions.thunderstorm_heavy_hail',
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
        : getWeatherTypeFromCode(weatherCode) ?? 'weather.conditions.clear_sky',
  };
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