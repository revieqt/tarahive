export enum ItineraryStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DONE = 'done',
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
  startDate: string;
  endDate: string;
  content?: unknown;
  status: 'active' | 'cancelled' | 'done';
  createdOn: string;
  updatedOn: string;
  privacy: 'private' | 'collaborators' | 'public';
  user?: UserItinerary;
}

export interface CreateItineraryRequest {
  title: string;
  type: string;
  startDate: Date;
  endDate: Date;
  content?: unknown;
  privacy: 'private' | 'collaborators' | 'public';
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
      return 'orange';
    case 'cancelled':
      return '#F44336';
    case 'done':
      return '#4CAF50';
    default:
      return '#000000';
  }
};