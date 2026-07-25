import { api } from '@/shared/api/client';
import { User } from '@/features/auth/context/SessionContext';

/**
 * Fetch user data by ID or username
 */
export const fetchUserByIdOrUsername = async (idOrUsername: string): Promise<User> => {
  if (!idOrUsername || idOrUsername.trim() === '') {
    throw new Error('User ID or username is required');
  }

  try {
    const response = await api.get<{ success: boolean; data: User }>(
      `/v1/user/${idOrUsername}`
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
