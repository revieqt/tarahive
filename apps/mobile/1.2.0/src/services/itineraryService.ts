import { api } from '@/api/client';
import {
  Itinerary,
  CreateItineraryRequest,
  CreateItineraryResponse,
  ItineraryResponse,
  AllItinerariesResponse,
  UpdateItineraryPayload,
  UpdateItineraryResponse,
} from '../types/itineraryTypes';

const API_URL = '/v2/itinerary';

export interface GetAllUserItinerariesOptions {
  currentMonth?: boolean;
  date?: string;
}

export const newItinerayId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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
): Promise<CreateItineraryResponse> => {
  const payload = {
    title: data.title,
    type: data.type,
    startDate: data.startDate.toISOString(),
    endDate: data.endDate.toISOString(),
    content: data.content,
    themeColor: data.themeColor,
  };

  return api.post<CreateItineraryResponse>(`${API_URL}/`, payload);
};

export const updateItinerary = async (
  payload: UpdateItineraryPayload
): Promise<UpdateItineraryResponse> => api.patch<UpdateItineraryResponse>(`${API_URL}/`, payload);