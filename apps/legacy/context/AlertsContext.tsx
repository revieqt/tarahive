import { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useSession } from './SessionContext';
import { useLocation } from '@/context/LocationContext';
import { useCurrentWeather, type WeatherData } from '@/hooks/useWeather';
import { BACKEND_URL, PREDEFINED_WEATHER_ALERTS } from '@/constants/Config';

// Storage keys
const GLOBAL_ALERTS_STORAGE_KEY = 'globalAlerts';
const LOCAL_ALERTS_STORAGE_KEY = 'localAlerts';

// Types
export type GlobalAlert = {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  locations?: string[];
  createdAt: string;
  expiresAt?: string;
  data?: any;
  isRead?: boolean;
};

export type LocalAlert = {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  data?: any;
  isRead?: boolean;
};

// Context Type
type AlertsContextType = {
  globalAlerts: GlobalAlert[];
  localAlerts: LocalAlert[];
  loading: boolean;
  error: string | null;
  refetchGlobalAlerts: () => void;
  fetchGlobalAlerts: () => void;
  removeLocalAlert: (alertId: string) => Promise<void>;
  markGlobalAlertAsRead: (alertId: string) => Promise<void>;
  markLocalAlertAsRead: (alertId: string) => Promise<void>;
  clearGlobalAlerts: () => Promise<void>;
  clearLocalAlerts: () => Promise<void>;
  getUnreadCount: () => number;
};

// Context initialization
const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

// Map weather code to alert type
const mapWeatherToAlertType = (weather: Partial<WeatherData>): string | null => {
  const { weatherCode = 0, temperature = 20, windSpeed = 0 } = weather;

  // Weather code mappings
  if (weatherCode >= 95 && weatherCode <= 99) {
    return 'thunderstorm';
  }
  if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) {
    return 'snow';
  }
  if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return 'rain';
  }
  if (weatherCode === 45 || weatherCode === 48 || weatherCode === 3) {
    return 'drizzle';
  }
  if (weatherCode === 0 || weatherCode === 1 || weatherCode === 2) {
    // Clear or cloudy - check for temperature extremes
    if (temperature && temperature > 35) {
      return 'extreme-heat';
    }
    if (temperature && temperature < 0) {
      return 'cold-temp';
    }
    return null; // Normal weather
  }

  // Check for strong wind (wind > 40 km/h)
  if (windSpeed && windSpeed > 40) {
    return 'strong-wind';
  }

  return null;
};

// Provider Component
export const AlertsProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useSession();
  const locationData = useLocation();

  const [globalAlerts, setGlobalAlerts] = useState<GlobalAlert[]>([]);
  const [localAlerts, setLocalAlerts] = useState<LocalAlert[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastWeatherAlertRef = useRef<string | null>(null);

  // Load local storage on mount
  useEffect(() => {
    const loadAlertsFromStorage = async () => {
      try {
        const [globalAlertsData, localAlertsData] = await Promise.all([
          AsyncStorage.getItem(GLOBAL_ALERTS_STORAGE_KEY),
          AsyncStorage.getItem(LOCAL_ALERTS_STORAGE_KEY),
        ]);

        if (globalAlertsData) {
          setGlobalAlerts(JSON.parse(globalAlertsData));
        }

        if (localAlertsData) {
          setLocalAlerts(JSON.parse(localAlertsData));
        }
      } catch (err) {
        console.error('[Alerts] Failed to load from storage:', err);
      } finally {
        setIsInitialized(true);
      }
    };

    loadAlertsFromStorage();
  }, []);

  // Fetch global alerts using TanStack Query (6 hour staleTime)
  const {
    data: fetchedAlerts = [],
    isLoading,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: ['globalAlerts', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error('User not authenticated');

      const locationsArray = locationData.latitude && locationData.longitude 
        ? [{ latitude: locationData.latitude, longitude: locationData.longitude }] 
        : [];

      const response = await fetch(`${BACKEND_URL}/api/alerts/get-user-alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          userId: session.user.id,
          locations: locationsArray,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data.alerts) ? data.alerts : Array.isArray(data) ? data : [];
    },
    enabled: !!session?.user?.id && isInitialized,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours cache
  });

  // Save global alerts to storage when they change
  useEffect(() => {
    if (fetchedAlerts.length > 0) {
      setGlobalAlerts(fetchedAlerts);
      AsyncStorage.setItem(GLOBAL_ALERTS_STORAGE_KEY, JSON.stringify(fetchedAlerts)).catch(err =>
        console.error('[Alerts] Failed to save global alerts:', err)
      );
    }
  }, [fetchedAlerts]);

  // Monitor weather and auto-create local alerts
  const { data: currentWeather } = useCurrentWeather(
    locationData.latitude,
    locationData.longitude,
    locationData.city || 'Current Location'
  );

  useEffect(() => {
    if (!currentWeather || currentWeather.temperature === null || currentWeather.windSpeed === null) return;

    // Ensure values are non-null for mapWeatherToAlertType
    const weatherToMap: WeatherData = {
      temperature: currentWeather.temperature,
      precipitation: currentWeather.precipitation ?? 0,
      humidity: currentWeather.humidity ?? 50,
      windSpeed: currentWeather.windSpeed,
      weatherCode: currentWeather.weatherCode,
      weatherType: currentWeather.weatherType,
    };

    const alertType = mapWeatherToAlertType(weatherToMap);
    if (!alertType || alertType === lastWeatherAlertRef.current) return;

    lastWeatherAlertRef.current = alertType;

    // Check if alert of this type already exists
    const existingAlert = localAlerts.find(alert => alert.type === alertType);
    if (existingAlert) return;

    const alertConfig = (PREDEFINED_WEATHER_ALERTS as unknown as Record<string, { title: string; type: string; description: string[] }>)[alertType];
    if (!alertConfig) return;

    const newAlert: LocalAlert = {
      id: `weather-${alertType}-${Date.now()}`,
      title: alertConfig.title,
      description: alertConfig.description.join('\n'),
      type: alertConfig.type,
      severity: alertType === 'extreme-heat' || alertType === 'thunderstorm' ? 'high' : 'medium',
      createdAt: new Date().toISOString(),
      data: {
        source: 'weather',
        temperature: currentWeather.temperature,
        weatherCode: currentWeather.weatherCode,
      },
    };

    const updatedAlerts = [...localAlerts, newAlert];
    setLocalAlerts(updatedAlerts);
    AsyncStorage.setItem(LOCAL_ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts)).catch(err =>
      console.error('[Alerts] Failed to save local alerts:', err)
    );

    console.log('[Alerts] Auto-created weather alert:', newAlert.type);
  }, [currentWeather, localAlerts]);

  // Remove local alert
  const removeLocalAlert = useCallback(
    async (alertId: string) => {
      try {
        const updatedAlerts = localAlerts.filter(alert => alert.id !== alertId);
        setLocalAlerts(updatedAlerts);
        await AsyncStorage.setItem(LOCAL_ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
        console.log('[Alerts] Removed local alert:', alertId);
      } catch (err) {
        console.error('[Alerts] Error removing local alert:', err);
      }
    },
    [localAlerts]
  );

  // Mark global alert as read
  const markGlobalAlertAsRead = useCallback(
    async (alertId: string) => {
      try {
        const updatedAlerts = globalAlerts.map(alert =>
          alert.id === alertId ? { ...alert, isRead: true } : alert
        );
        setGlobalAlerts(updatedAlerts);
        await AsyncStorage.setItem(GLOBAL_ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
        console.log('[Alerts] Marked global alert as read:', alertId);
      } catch (err) {
        console.error('[Alerts] Error marking global alert as read:', err);
      }
    },
    [globalAlerts]
  );

  // Mark local alert as read
  const markLocalAlertAsRead = useCallback(
    async (alertId: string) => {
      try {
        const updatedAlerts = localAlerts.map(alert =>
          alert.id === alertId ? { ...alert, isRead: true } : alert
        );
        setLocalAlerts(updatedAlerts);
        await AsyncStorage.setItem(LOCAL_ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
        console.log('[Alerts] Marked local alert as read:', alertId);
      } catch (err) {
        console.error('[Alerts] Error marking local alert as read:', err);
      }
    },
    [localAlerts]
  );

  // Get count of unread alerts
  const getUnreadCount = useCallback(() => {
    const unreadGlobal = globalAlerts.filter(alert => !alert.isRead).length;
    const unreadLocal = localAlerts.filter(alert => !alert.isRead).length;
    return unreadGlobal + unreadLocal;
  }, [globalAlerts, localAlerts]);

  // Clear all global alerts
  const clearGlobalAlerts = useCallback(async () => {
    try {
      setGlobalAlerts([]);
      await AsyncStorage.removeItem(GLOBAL_ALERTS_STORAGE_KEY);
      console.log('[Alerts] Cleared global alerts');
    } catch (err) {
      console.error('[Alerts] Error clearing global alerts:', err);
    }
  }, []);

  // Clear all local alerts
  const clearLocalAlerts = useCallback(async () => {
    try {
      setLocalAlerts([]);
      await AsyncStorage.removeItem(LOCAL_ALERTS_STORAGE_KEY);
      console.log('[Alerts] Cleared local alerts');
    } catch (err) {
      console.error('[Alerts] Error clearing local alerts:', err);
    }
  }, []);

  if (!isInitialized) {
    return null;
  }

  return (
    <AlertsContext.Provider
      value={{
        globalAlerts,
        localAlerts,
        loading: isLoading,
        error: fetchError instanceof Error ? fetchError.message : null,
        refetchGlobalAlerts: () => refetch(),
        fetchGlobalAlerts: () => refetch(),
        removeLocalAlert,
        markGlobalAlertAsRead,
        markLocalAlertAsRead,
        clearGlobalAlerts,
        clearLocalAlerts,
        getUnreadCount,
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
};

// Hook
export const useAlerts = (): AlertsContextType => {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
};
