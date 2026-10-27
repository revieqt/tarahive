import { api } from '@/api/client';
import { ApiError } from '@/api/errors';
import {
  Room,
  CreateRoomRequest,
  CreateRoomResponse,
  RoomResponse,
  UserRoom,
  UserRoomsResponse,
  UpdateRoomPayload,
  UpdateRoomResponse,
  RoomMember,
  RoomMembersResponse,
} from '@/types/roomTypes';

const API_URL = '/v2/room';

export const getUserRooms = async (): Promise<UserRoom[]> => {
  const response = await api.get<UserRoomsResponse>(`${API_URL}/`);
  if (!response.success || !response.rooms) {
    throw new Error(response.message || 'Failed to retrieve rooms');
  }
  return response.rooms;
};

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

export const updateRoom = async (
  roomId: string,
  payload: UpdateRoomPayload
): Promise<UpdateRoomResponse> =>
  api.patch<UpdateRoomResponse>(`${API_URL}/${encodeURIComponent(roomId)}`, payload);

export const getRoomMembers = async (roomId: string): Promise<RoomMember[]> => {
  const response = await api.get<RoomMembersResponse>(
    `${API_URL}/${encodeURIComponent(roomId)}/members`
  );
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to retrieve room members');
  }
  return response.data;
};