import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL } from '@/Config';

const API_URL = `${BACKEND_URL}/v1/weather`;

export interface WeatherData {
  temperature: number | null;
  precipitation: number | null;
  humidity: number | null;
  windSpeed: number | null;
  weatherType: string;
  weatherCode: number;
}

const fetchWeather = async (
  city: string,
  latitude: number,
  longitude: number
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
  return responseData.data || responseData;
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