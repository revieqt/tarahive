import { api } from '@/shared/api/client';
import { User } from '@/features/auth/context/SessionContext';
import { UpdateVisibilitySettingsPayload } from '../types/userTypes';

const API_URL = `/v1/user`;

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