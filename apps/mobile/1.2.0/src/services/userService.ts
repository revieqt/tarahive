import { api } from '@/api/client';
import { User } from '@/context/SessionContext';
import {
  SetupAccountPayload,
  UpdateProfilePayload,
  UpdateVisibilitySettingsPayload,
} from '@/types/userTypes';

const API_URL = `/v1/user`;
const SETUP_API_URL = `/v2/user`;

export const setupUserAccount = async (
  payload: SetupAccountPayload & { username: string },
): Promise<{ success: boolean; message: string; data: User }> => {
  return await api.patch<{ success: boolean; message: string; data: User }>(
    `${SETUP_API_URL}/setup`,
    payload,
  );
};

/**
 * Fetch user data by ID or username
 */
export const fetchUserByIdOrUsername = async (idOrUsername: string): Promise<User> => {
  if (!idOrUsername || idOrUsername.trim() === '') {
    throw new Error('User ID or username is required');
  }

  try {
    const response = await api.get<{ success: boolean; data: User }>(
      `${API_URL}/${idOrUsername}`
    );

    if (!response.success || !response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error('User not found');
    }
    if (error.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error(error.message || 'Failed to fetch user');
  }
};

export const updateVisibilitySettings = async (
  payload: UpdateVisibilitySettingsPayload
): Promise<{ success: boolean; data: User; message: string }> => {
  return await api.patch<{ success: boolean; data: User; message: string }>(
    `${API_URL}/update-visibility`,
    {
      visibility: {
        isProfilePublic: payload.visibility.isProfilePublic,
        isPersonalInfoPublic: payload.visibility.isPersonalInfoPublic,
        isTravelInfoPublic: payload.visibility.isTravelInfoPublic,
      },
    }
  );
};

export const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<{ success: boolean; data: User; message: string }> => {
  return await api.patch<{ success: boolean; data: User; message: string }>(
    `${API_URL}/update-profile`,
    payload
  );
};