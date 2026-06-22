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
  address: Address;
  note: string;
}

export interface DailyItinerary {
  date: string;
  locations: Location[];
}

export interface UserItinerary {
  id: string;
  username: string;
  isProUser: boolean;
}

export interface Itinerary {
  id: string;
  title: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string;
  planDaily: boolean;
  locations: Location[] | DailyItinerary[];
  status: 'active' | 'cancelled' | 'done';
  createdOn: string;
  updatedOn: string;
  isPrivate: boolean;
  user?: UserItinerary; // Optional - included when viewing individual itinerary
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
      return '#FF653F';
    case 'cancelled':
      return '#F44336';
    case 'done':
      return '#4CAF50';
    default:
      return '#000000';
  }
};