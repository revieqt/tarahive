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

export interface NominatimAddress {
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

export interface NominatimResponse {
  address: NominatimAddress;
  display_name: string;
}

export type LocationContextType = {
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