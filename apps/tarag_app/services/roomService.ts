import { BACKEND_URL } from '@/constants/Config';
import { getAccessToken } from '@/utils/getAccessToken';

const API_URL = `${BACKEND_URL}/api/rooms`;

export interface RoomMember {
  userID: string;
  nickname?: string;
  username?: string;
  profileImage?: string;
  joinedOn: string;
  status: 'member' | 'invited' | 'waiting';
}

export interface Room {
  id: string;
  name: string;
  roomImage?: string;
  memberCount?: number;
  membershipStatus?: 'member' | 'invited' | 'waiting';
}

export interface RoomDetail {
  _id: string;
  name: string;
  inviteCode: string;
  roomImage?: string;
  roomColor: string;
  itineraryID?: string;
  itineraryTitle?: string;
  itineraryStartDate?: string;
  itineraryEndDate?: string;
  chatID: string;
  admins: string[];
  members: RoomMember[];
}

export interface CreateRoomData {
  name: string;
  invitedMembers?: string[];
  itineraryID?: string;
}

export interface CreateRoomResponse {
  id: string;
  name: string;
  inviteCode: string;
  roomColor: string;
  roomImage: string;
  itineraryID: string;
  chatID: string;
  admins: string[];
  members: RoomMember[];
}

/**
 * Get all rooms the user is a member of
 * @param status - Filter rooms by membership status: 'member' (default), 'invited', 'waiting', or 'all' for all statuses
 */
export const getRooms = async (status: string = 'member'): Promise<Room[]> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}?status=${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch rooms');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch rooms');
  }
};

/**
 * Get specific room details by ID
 */
export const getSpecificRoom = async (roomID: string): Promise<RoomDetail> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}/view/${roomID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch room details');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch room details');
  }
};

/**
 * Create a new room
 */
export const createRoom = async (
  roomData: CreateRoomData
): Promise<CreateRoomResponse> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(roomData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create room');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create room');
  }
};

/**
 * Leave a room
 */
export const leaveRoom = async (roomID: string): Promise<void> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomID }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to leave room');
    }

    // Success response returns no content (200 with empty body)
  } catch (error: any) {
    throw new Error(error.message || 'Failed to leave room');
  }
};

/**
 * Update room name
 */
export const updateRoomName = async (roomID: string, name: string): Promise<void> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}/update-name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomID, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update room name');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update room name');
  }
};

/**
 * Update room image
 */
export const updateRoomImage = async (roomID: string, imageUri: string): Promise<void> => {
  try {
    const token = await getAccessToken();
    
    const formData = new FormData();
    formData.append('roomID', roomID);
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'room-image.jpg',
    } as any);

    const response = await fetch(`${API_URL}/update-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update room image');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update room image');
  }
};

/**
 * Update room color
 */
export const updateRoomColor = async (roomID: string, color: string): Promise<void> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}/update-color`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomID, color }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update room color');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update room color');
  }
};

/**
 * Attach itinerary to room
 */
export const attachItinerary = async (roomID: string, itineraryID: string): Promise<void> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}/attach-itinerary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomID, itineraryID }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to attach itinerary');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to attach itinerary');
  }
};

/**
 * Unattach itinerary from room
 */
export const unattachItinerary = async (roomID: string): Promise<void> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}/unattach-itinerary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomID }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to unattach itinerary');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to unattach itinerary');
  }
};

/**
 * Invite user to room
 */
export const inviteUser = async (roomID: string, userID: string): Promise<void> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomID, userID }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to invite user');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to invite user');
  }
};

/**
 * Approve or reject an invite
 */
export const approveInvite = async (roomID: string, approval: boolean): Promise<void> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}/approve-invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomID, approval }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process invite');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to process invite');
  }
};

/**
 * Request to join a room
 */
export const requestToJoin = async (roomID: string): Promise<void> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}/request-to-join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomID }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to request join');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to request join');
  }
};

/**
 * Approve or reject a join request (admin only)
 */
export const approveJoinRequest = async (roomID: string, userID: string, approval: boolean): Promise<void> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}/approve-join-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomID, userID, approval }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process join request');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to process join request');
  }
};

/**
 * Change a user's nickname in the room (admin only)
 */
export const changeUserNickname = async (roomID: string, userID: string, nickname: string): Promise<void> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}/change-user-nickname`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomID, userID, nickname }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change nickname');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to change nickname');
  }
};

/**
 * Kick user from room (admin only)
 */
export const kickUser = async (roomID: string, userID: string): Promise<void> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}/kick-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomID, userID }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to kick user');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to kick user');
  }
};

/**
 * Elevate user to admin (admin only)
 */
export const elevateToAdmin = async (roomID: string, userID: string): Promise<void> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}/elevate-to-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomID, userID }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to elevate user');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to elevate user');
  }
};

// ===========================
// MESSAGE ENDPOINTS
// ===========================

export interface Message {
  _id: string;
  roomId: string;
  senderId: string;
  message: string;
  createdAt: string;
  seenBy: string[];
  isSystemMessage?: boolean;
}

/**
 * Get messages for a room with cursor-based pagination
 * @param roomID - The room ID to fetch messages from
 * @param limit - Number of messages to return (default: 20, max: 100)
 * @param cursor - Timestamp cursor for pagination (optional)
 */
export const getMessages = async (
  roomID: string,
  limit: number = 20,
  cursor?: string
): Promise<Message[]> => {
  try {
    const token = await getAccessToken();
    const messageAPI = `${BACKEND_URL}/api/messages`;

    let url = `${messageAPI}/${roomID}?limit=${Math.min(limit, 100)}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch messages');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch messages');
  }
};

/**
 * Mark messages as seen
 * @param roomID - The room ID containing the messages
 * @param messageIds - Array of message IDs to mark as seen
 */
export const markMessagesSeen = async (
  roomID: string,
  messageIds: string[]
): Promise<void> => {
  try {
    const token = await getAccessToken();
    const messageAPI = `${BACKEND_URL}/api/messages`;

    const response = await fetch(`${messageAPI}/mark-seen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomID, messageIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark messages as seen');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to mark messages as seen');
  }
};
