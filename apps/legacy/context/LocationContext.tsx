import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';

export interface LocationData {
  latitude: number;
  longitude: number;
  suburb: string;
  city: string;
  state: string;
  region: string;
  country: string;
}

export interface Address {
  country?: string;
  region?: string;
  province?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  postal_code?: string;
}

interface NominatimAddress {
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  hamlet?: string;
  village?: string;
  town?: string;
  city?: string;
  municipality?: string;
  county?: string;
  state?: string;
  region?: string;
  country?: string;
  country_code?: string;
  postcode?: string;
}

interface NominatimResponse {
  address: NominatimAddress;
  display_name: string;
}

type LocationContextType = {
  latitude: number;
  longitude: number;
  suburb: string;
  city: string;
  state: string;
  region: string;
  country: string;
  loading: boolean;
  error: string | null;
  address: Address | null;
  refreshLocation: () => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Parse address from Nominatim response
function parseAddressFromNominatim(addressData: any): Address {
  return {
    country: addressData.address?.country || undefined,
    region: addressData.address?.state || undefined,
    province: addressData.address?.county || undefined,
    city: addressData.address?.city || addressData.address?.town || addressData.address?.village || undefined,
    district: addressData.address?.district || addressData.address?.suburb || undefined,
    neighborhood: addressData.address?.neighbourhood || addressData.address?.neighborhood || undefined,
    postal_code: addressData.address?.postcode || undefined,
  };
}

// Extract display fields from address for backward compatibility
function extractLocationDisplayFields(address: Address): {
  suburb: string;
  city: string;
  state: string;
  region: string;
  country: string;
} {
  return {
    suburb: address.district || address.neighborhood || '',
    city: address.city || '',
    state: address.region || '',
    region: address.region || '',
    country: address.country || '',
  };
}

// Reverse geocode function used by React Query
async function reverseGeocodeLocation(latitude: number, longitude: number): Promise<Address> {
  try {
    console.log('[LocationProvider] Starting reverse geocode for:', { latitude, longitude });
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'TaraG/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address data from Nominatim');
    }

    const data: NominatimResponse = await response.json();
    console.log('[LocationProvider] Nominatim response:', data);

    const address = parseAddressFromNominatim(data);
    console.log('[LocationProvider] Parsed address:', address);

    return address;
  } catch (err) {
    console.error('[LocationProvider] Reverse geocoding error:', err);
    throw err;
  }
}

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Request location on mount
  useEffect(() => {
    const getCoordinates = async () => {
      try {
        setPermissionError(null);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermissionError('Location permission denied');
          return;
        }
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = location.coords;
        console.log('[LocationProvider] Got coordinates:', { latitude, longitude });
        setCoordinates({ latitude, longitude });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to get location';
        console.error('[LocationProvider] Error getting coordinates:', errorMsg);
        setPermissionError(errorMsg);
      }
    };

    getCoordinates();
  }, []);

  // Use React Query for reverse geocoding - 2 min stale time, only loads once
  const { data: address, isLoading, error: queryError } = useQuery({
    queryKey: ['reverseGeocode', coordinates?.latitude ?? 0, coordinates?.longitude ?? 0],
    queryFn: () => {
      if (!coordinates) {
        return Promise.resolve({} as Address);
      }
      return reverseGeocodeLocation(coordinates.latitude, coordinates.longitude);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - only refresh data after 2 mins of inactivity
    gcTime: 3 * 60 * 1000, // 3 minutes - keep in cache for 3 mins
    enabled: !!coordinates, // Only run query when coordinates are available
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on mount if data is already cached
  });

  // Extract display fields from address
  const displayFields = address
    ? extractLocationDisplayFields(address)
    : {
        suburb: '',
        city: '',
        state: '',
        region: '',
        country: '',
      };

  const error = permissionError || (queryError instanceof Error ? queryError.message : null);

  const value: LocationContextType = {
    latitude: coordinates?.latitude ?? 0,
    longitude: coordinates?.longitude ?? 0,
    suburb: displayFields.suburb,
    city: displayFields.city,
    state: displayFields.state,
    region: displayFields.region,
    country: displayFields.country,
    loading: isLoading,
    error,
    address: address || null,
    refreshLocation: () => {
      console.log('[LocationProvider] Refresh triggered - data will be re-fetched when stale');
    },
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
