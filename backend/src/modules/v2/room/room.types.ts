import { RoomPrivacy } from './room.entity';

export interface CreateRoomRequest {
  name: string;
  itineraryId?: string;
}

export interface UpdateRoomRequest {
  roomImage?: Buffer;
  name?: string;
  description?: string | null;
  privacy?: RoomPrivacy;
  themeColor?: string;
}