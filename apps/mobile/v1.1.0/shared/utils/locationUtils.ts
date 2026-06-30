import { Address } from '../types/location';

// Parse address from Nominatim response
export function parseAddressFromNominatim(addressData: any): Address {
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
export function extractLocationDisplayFields(address: Address): {
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
