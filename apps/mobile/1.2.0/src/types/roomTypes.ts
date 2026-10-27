export interface Room {
  id: string;
  itineraryId: string | null;
  name: string;
  description: string | null;
  privacy: RoomPrivacy;
  themeColor: string;
  roomImage: string | null;
  createdOn: string;
  updatedOn: string;
  itinerary: RoomItinerary | null;
}

export interface RoomItinerary {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: string;
}

export interface UserRoom {
  id: string;
  name: string;
  privacy: string;
  themeColor: string;
  roomImage: string | null;
  description: string | null;
  members: number;
}

export interface RoomMember {
  id: string;
  userId: string;
  nickname: string;
  role: 'ADMIN' | 'MEMBER';
  status: 'ACTIVE' | 'INVITED' | 'REQUESTED';
  user: {
    username: string | null;
    fname: string | null;
    lname: string | null;
    profileImage: string | null;
  };
}

export interface RoomMembersResponse {
  success: boolean;
  message: string;
  data?: RoomMember[];
}

export interface RoomInvitePayload {
  userId: string;
  roomId: string;
}

export interface RoomInviteResponse {
  success: boolean;
  message: string;
}

export interface RoomMembershipPayload {
  roomId: string;
  userId?: string;
}

export interface UserRoomsResponse {
  success: boolean;
  rooms?: UserRoom[];
  message?: string;
}

export interface CreateRoomRequest {
  name: string;
  itineraryId?: string;
}

export interface RoomResponse {
  success: boolean;
  message: string;
  room?: Room;
  member?: Pick<RoomMember, 'id' | 'role' | 'status'>;
}

export interface RoomAccessData {
  room: Room;
  member?: Pick<RoomMember, 'id' | 'role' | 'status'>;
}

export interface CreateRoomResponse {
  success: boolean;
  message: string;
  roomId: string;
}

export type RoomPrivacy = 'PRIVATE' | 'PUBLIC';

export interface UpdateRoomPayload {
  roomImage?: string;
  name?: string;
  description?: string | null;
  privacy?: RoomPrivacy;
  themeColor?: string;
}

export interface UpdateRoomResponse {
  success: boolean;
  message: string;
  data?: Room;
}

export interface RoomImageUpload {
  uri: string;
  base64: string;
}