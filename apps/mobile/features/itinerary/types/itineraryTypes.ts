export enum ItineraryStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DONE = 'done',
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

export interface Location {
  latitude: number;
  longitude: number;
  locationName: string;
  address?: Address;
  note?: string;
}

export interface DailyItinerary {
  date: Date;
  locations: Location[];
}

export interface Itinerary {
  id: string;
  title: string;
  type: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: ItineraryStatus;
}

export interface CreateItineraryRequest {
  title: string;
  type: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  planDaily: boolean;
  locations: Location[] | DailyItinerary[];
}

export interface ItineraryResponse {
  success: boolean;
  message: string;
  data: Itinerary;
}

export interface AllItinerariesResponse {
  success: boolean;
  message: string;
  data: Itinerary[];
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return '#2196F3';
    case 'cancelled':
      return '#F44336';
    case 'done':
      return '#4CAF50';
    default:
      return '#000000';
  }
};