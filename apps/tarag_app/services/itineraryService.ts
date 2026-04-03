import { BACKEND_URL } from '@/constants/Config';
import { getAccessToken } from '@/utils/getAccessToken';

const API_URL = `${BACKEND_URL}/api/itineraries`;

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

export interface Itinerary {
  _id: string;
  userID: string;
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
  username?: string; // Optional - included when viewing individual itinerary
}

export interface CreateItineraryData {
  title: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string;
  planDaily: boolean;
  locations: Location[] | DailyItinerary[];
}

export interface UpdateItineraryData {
  title?: string;
  type?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  planDaily?: boolean;
  locations?: Location[] | DailyItinerary[];
  status?: 'active' | 'cancelled' | 'done';
}

/**
 * View a single itinerary by ID
 */
export const viewItinerary = async (itineraryID: string): Promise<Itinerary> => {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(`${API_URL}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        itineraryID,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to view itinerary');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to view itinerary');
  }
};

/**
 * View all itineraries for the authenticated user
 */
export const viewUserItineraries = async (): Promise<Itinerary[]> => {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(`${API_URL}/user/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch itineraries');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch itineraries');
  }
};

/**
 * Create a new itinerary
 */
export const createItinerary = async (
  itineraryData: CreateItineraryData
): Promise<Itinerary> => {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(`${API_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(itineraryData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create itinerary');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create itinerary');
  }
};

/**
 * Update an itinerary
 */
export const updateItinerary = async (
  itineraryID: string,
  updateData: UpdateItineraryData
): Promise<Itinerary> => {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(`${API_URL}/update/${itineraryID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update itinerary');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update itinerary');
  }
};

/**
 * Repeat an itinerary (update with new dates and set status to 'active')
 */
export const repeatItinerary = async (
  itineraryID: string,
  updateData: UpdateItineraryData
): Promise<Itinerary> => {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(`${API_URL}/repeat/${itineraryID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to repeat itinerary');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to repeat itinerary');
  }
};

/**
 * Delete an itinerary
 */
export const deleteItinerary = async (itineraryID: string): Promise<Itinerary> => {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(`${API_URL}/delete/${itineraryID}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete itinerary');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete itinerary');
  }
};

/**
 * Cancel an itinerary
 */
export const cancelItinerary = async (itineraryID: string): Promise<Itinerary> => {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(`${API_URL}/cancel/${itineraryID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel itinerary');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to cancel itinerary');
  }
};

/**
 * Mark an itinerary as done
 */
export const markItineraryAsDone = async (itineraryID: string): Promise<Itinerary> => {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(`${API_URL}/mark-done/${itineraryID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark itinerary as done');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to mark itinerary as done');
  }
};

/**
 * Update itinerary privacy (toggle isPrivate)
 */
export const updateItineraryPrivacy = async (itineraryID: string): Promise<Itinerary> => {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(`${API_URL}/update-privacy/${itineraryID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update itinerary privacy');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update itinerary privacy');
  }
};
