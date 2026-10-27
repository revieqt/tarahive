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
  RoomInvitePayload,
  RoomInviteResponse,
  RoomAccessData,
  RoomMembershipPayload,
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
export const getRoomById = async (id: string): Promise<RoomAccessData | null> => {
  try {
    const response = await api.get<RoomResponse>(`${API_URL}/${id}`);
    if (!response.room) {
      throw new Error(response.message || 'Room response did not include room data');
    }
    return {
      room: response.room,
      ...(response.member ? { member: response.member } : {}),
    };
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

export const inviteRoomMember = async (
  payload: RoomInvitePayload
): Promise<RoomInviteResponse> =>
  api.post<RoomInviteResponse>(`${API_URL}/invite`, payload);

export const removeRoomInvite = async (
  payload: RoomInvitePayload
): Promise<RoomInviteResponse> =>
  api.delete<RoomInviteResponse>(`${API_URL}/invite`, {
    body: JSON.stringify(payload),
  });

export const requestRoomMembership = async (
  payload: Pick<RoomMembershipPayload, 'roomId'>
): Promise<RoomInviteResponse> =>
  api.post<RoomInviteResponse>(`${API_URL}/request`, payload);

export const cancelRoomMembershipRequest = async (
  payload: Pick<RoomMembershipPayload, 'roomId'>
): Promise<RoomInviteResponse> =>
  api.delete<RoomInviteResponse>(`${API_URL}/request`, {
    body: JSON.stringify(payload),
  });

export const approveRoomMembershipRequest = async (
  payload: RoomMembershipPayload & { userId: string }
): Promise<RoomInviteResponse> =>
  api.post<RoomInviteResponse>(`${API_URL}/request/approve`, payload);

export const acceptRoomInvite = async (
  payload: RoomMembershipPayload & { userId: string }
): Promise<RoomInviteResponse> =>
  api.post<RoomInviteResponse>(`${API_URL}/invite/accept`, payload);