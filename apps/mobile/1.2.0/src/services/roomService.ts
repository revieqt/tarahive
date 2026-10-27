import { api } from '@/api/client';
import { ApiError } from '@/api/errors';
import {
  Room,
  CreateRoomRequest,
  CreateRoomResponse,
  RoomResponse,
} from '@/types/roomTypes';

const API_URL = '/v2/room';

/**
 * Get a specific room by ID
 */
export const getRoomById = async (id: string): Promise<Room | null> => {
  try {
    const response = await api.get<RoomResponse>(`${API_URL}/${id}`);
    if (!response.data) {
      throw new Error(response.message || 'Room response did not include room data');
    }
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Create a new room
 */
export const createRoom = async (
  data: CreateRoomRequest
): Promise<CreateRoomResponse> =>
  api.post<CreateRoomResponse>(`${API_URL}/`, data);