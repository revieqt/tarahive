import { api } from '@/shared/api/client';
import {
  Itinerary,
  CreateItineraryRequest,
  ItineraryResponse,
  AllItinerariesResponse,
} from '../types/itineraryTypes';

const API_URL = '/v1/itinerary';

export interface GetAllUserItinerariesOptions {
  currentMonth?: boolean;
  date?: string;
}

/**
 * Get all user itineraries
 * @param status - Filter by status: 'active' (default), 'done', or 'cancelled'
 * @param options - Optional backend filters for the MonthlyCalendar flow
 */
export const getAllUserItineraries = async (
  status: string = 'active',
  options?: GetAllUserItinerariesOptions
): Promise<Itinerary[]> => {
  const response = await api.get<AllItinerariesResponse>(`${API_URL}/`, {
    params: {
      status,
      currentMonth: options?.currentMonth ? true : undefined,
      day: options?.date,
    },
  });

  return response.data || [];
};

/**
 * Get a specific itinerary by ID
 */
export const getItineraryById = async (id: string): Promise<Itinerary | null> => {
  try {
    const response = await api.get<ItineraryResponse>(`${API_URL}/${id}`);
    return response.data || null;
  } catch (error: any) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Create a new itinerary
 */
export const createItinerary = async (
  data: CreateItineraryRequest
): Promise<Itinerary> => {
  const payload = {
    title: data.title,
    type: data.type,
    startDate: data.startDate.toISOString(),
    endDate: data.endDate.toISOString(),
    content: data.content,
    privacy: data.privacy,
  };

  const response = await api.post<ItineraryResponse>(`${API_URL}/create`, payload);
  return response.data;
};

/**
 * Delete an itinerary
 */
export const deleteItinerary = async (id: string): Promise<void> => {
  await api.delete(`${API_URL}/delete/${id}`);
};
