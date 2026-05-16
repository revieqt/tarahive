import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for route data
const ROUTE_STORAGE_KEY = 'activeRoute';

// 🛣️ Route Data Types
export type RouteStep = {
  distance: number;
  duration: number;
  instruction: string;
  name?: string;
  way_points: [number, number];
};

export type RouteSegment = {
  distance: number;
  duration: number;
  steps?: RouteStep[];
};

export type RouteData = {
  geometry: {
    coordinates: [number, number, number?][];
    type: string;
  };
  distance: number;
  duration: number;
  bbox?: number[];
  segments: RouteSegment[];
};

// 🥾 Breadcrumb Trail Types
export type BreadcrumbPoint = {
  latitude: number;
  longitude: number;
  timestamp: number; // milliseconds since epoch
  accuracy?: number; // GPS accuracy in meters
};

// 📍 ActiveRoute type
export type ActiveRoute = {
  routeID: string;
  type: 'generated' | 'tracking';
  location?: { latitude: number; longitude: number; locationName?: string }[];
  mode?: string;
  status?: string;
  createdOn: Date;
  routeData?: RouteData; // for generated routes
  timer?: number;
  distanceTravelled?: number;
  breadcrumbs?: BreadcrumbPoint[]; // User's traveled path
};

// 💡 Context shape
type RouteContextType = {
  activeRoute: ActiveRoute | undefined;
  setActiveRoute: (route: ActiveRoute | undefined) => Promise<void>;
  clearActiveRoute: () => Promise<void>;
  elapsedTime: number;
  distanceTravelled: number;
  updateDistanceTravelled: (distance: number) => Promise<void>;
  addLocationPoint: (point: { latitude: number; longitude: number; locationName?: string }) => Promise<void>;
  startTrackingRoute: (routeID?: string) => Promise<void>;
  addBreadcrumb: (point: BreadcrumbPoint) => Promise<void>;
  clearBreadcrumbs: () => Promise<void>;
  getBreadcrumbs: () => BreadcrumbPoint[];
};

// 🔗 Context init
const RouteContext = createContext<RouteContextType | undefined>(undefined);

// 🔐 Provider
export const RouteProvider = ({ children }: { children: ReactNode }) => {
  const [activeRoute, setActiveRouteState] = useState<ActiveRoute | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distanceTravelled, setDistanceTravelledState] = useState(0);

  // Load route data on mount
  useEffect(() => {
    const loadRoute = async () => {
      try {
        const stored = await AsyncStorage.getItem(ROUTE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed) parsed.createdOn = new Date(parsed.createdOn);
          setActiveRouteState(parsed);
          setElapsedTime(parsed.timer || 0);
          setDistanceTravelledState(parsed.distanceTravelled || 0);
        }
      } catch (err) {
        console.error('Failed to load route data:', err);
      } finally {
        setIsInitialized(true);
      }
    };
    loadRoute();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!activeRoute) {
      setElapsedTime(0);
      setDistanceTravelledState(0);
      return;
    }
    const interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [activeRoute]);

  // Update activeRoute in state and AsyncStorage
  const setActiveRoute = async (route: ActiveRoute | undefined) => {
    try {
      if (route) {
        const routeWithTracking = {
          ...route,
          timer: elapsedTime,
          distanceTravelled,
        };
        await AsyncStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(routeWithTracking));
        setActiveRouteState(routeWithTracking);
        setElapsedTime(0);
        setDistanceTravelledState(0);
      } else {
        await AsyncStorage.removeItem(ROUTE_STORAGE_KEY);
        setActiveRouteState(undefined);
        setElapsedTime(0);
        setDistanceTravelledState(0);
      }
    } catch (err) {
      console.error('Failed to update active route:', err);
    }
  };

  const clearActiveRoute = async () => setActiveRoute(undefined);

  const updateDistanceTravelled = async (distance: number) => {
    setDistanceTravelledState(distance);
    if (activeRoute) {
      try {
        const routeWithTracking = {
          ...activeRoute,
          timer: elapsedTime,
          distanceTravelled: distance,
        };
        await AsyncStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(routeWithTracking));
      } catch (err) {
        console.error('Failed to update distance travelled:', err);
      }
    }
  };

  // ✅ Add new location point for tracking (offline or generated route)
  const addLocationPoint = async (point: { latitude: number; longitude: number; locationName?: string }) => {
    if (!activeRoute) return;
    const updatedRoute: ActiveRoute = {
      ...activeRoute,
      location: [...(activeRoute.location || []), point],
    };
    await setActiveRoute(updatedRoute);
  };

  // ✅ Start a new offline tracking route
  const startTrackingRoute = async (routeID?: string) => {
    const newRoute: ActiveRoute = {
      routeID: routeID || `tracking-${Date.now()}`,
      type: 'tracking',
      location: [],
      breadcrumbs: [],
      createdOn: new Date(),
      timer: 0,
      distanceTravelled: 0,
    };
    await setActiveRoute(newRoute);
  };

  // 🥾 Add breadcrumb point (real-time location tracking)
  const addBreadcrumb = async (point: BreadcrumbPoint) => {
    if (!activeRoute) return;
    
    try {
      const updatedRoute: ActiveRoute = {
        ...activeRoute,
        breadcrumbs: [...(activeRoute.breadcrumbs || []), point],
      };
      
      await AsyncStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify({
        ...updatedRoute,
        createdOn: updatedRoute.createdOn.toISOString(),
      }));
      
      setActiveRouteState(updatedRoute);
    } catch (err) {
      console.error('Failed to add breadcrumb:', err);
    }
  };

  // 🧹 Clear all breadcrumbs
  const clearBreadcrumbs = async () => {
    if (!activeRoute) return;
    
    try {
      const updatedRoute: ActiveRoute = {
        ...activeRoute,
        breadcrumbs: [],
      };
      
      await AsyncStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify({
        ...updatedRoute,
        createdOn: updatedRoute.createdOn.toISOString(),
      }));
      
      setActiveRouteState(updatedRoute);
    } catch (err) {
      console.error('Failed to clear breadcrumbs:', err);
    }
  };

  // 📍 Get breadcrumbs
  const getBreadcrumbs = (): BreadcrumbPoint[] => {
    return activeRoute?.breadcrumbs || [];
  };

  if (!isInitialized) return null;

  return (
    <RouteContext.Provider
      value={{
        activeRoute,
        setActiveRoute,
        clearActiveRoute,
        elapsedTime,
        distanceTravelled,
        updateDistanceTravelled,
        addLocationPoint,
        startTrackingRoute,
        addBreadcrumb,
        clearBreadcrumbs,
        getBreadcrumbs,
      }}
    >
      {children}
    </RouteContext.Provider>
  );
};

// 🎯 Hook
export const useRoute = (): RouteContextType => {
  const context = useContext(RouteContext);
  if (!context) throw new Error('useRoute must be used within a RouteProvider');
  return context;
};
