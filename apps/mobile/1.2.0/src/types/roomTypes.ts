export interface Room {
  id: string;
  itineraryId: string | null;
  name: string;
  description: string | null;
  privacy: string;
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

export interface CreateRoomRequest {
  name: string;
  itineraryId?: string;
}

export interface RoomResponse {
  success: boolean;
  message: string;
  data?: Room;
}

export interface CreateRoomResponse {
  success: boolean;
  message: string;
  roomId: string;
}