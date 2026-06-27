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
  content: string;
  status: 'active' | 'cancelled' | 'done';
  createdOn: string;
  updatedOn: string;
  privacy: 'Only Me' | 'Public';
  user?: UserItinerary;
}

export interface CreateItineraryRequest {
  title: string;
  type: string;
  startDate: Date;
  endDate: Date;
  content: string;
  privacy: 'Only Me' | 'Public';
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