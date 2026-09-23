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
  themeColor: string;
  privacy?: 'private' | 'collaborators' | 'public';
}

export interface CreateItineraryForm {
  title: string;
  type: string;
  startDate: Date | null;
  endDate: Date | null;
  themeColor: string;
  content?: unknown;
}

export interface ItineraryResponse {
  success: boolean;
  message: string;
  data: Itinerary;
}

export interface CreateItineraryResponse {
  success: boolean;
  message: string;
  itineraryID: string;
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

export const THEME_COLORS = [
  { label: 'Rose Pink (Default)', value: '#FF6B6B' },
  { label: 'Coral Red', value: '#E76F51' },
  { label: 'Sunset Orange', value: '#F2994A' },
  { label: 'Sunny Yellow', value: '#F4C95D' },
  { label: 'Lime Green', value: '#7CB342' },
  { label: 'Forest Green', value: '#4CAF7D' },
  { label: 'Tropical Teal', value: '#5BB8C9' },
  { label: 'Ocean Blue', value: '#4A90E2' },
  { label: 'Lavender', value: '#8E7CC3' },
  { label: 'Twilight Purple', value: '#6C63A8' },
  { label: 'Slate Gray', value: '#78909C' },
  { label: 'Earth Brown', value: '#A67C52' },
];