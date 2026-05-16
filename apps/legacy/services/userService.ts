import { BACKEND_URL } from '@/constants/Config';
import { getAccessToken } from '@/utils/getAccessToken';

const API_URL = `${BACKEND_URL}/api/users`;

interface UpdateBooleanResponse {
  message: string;
  data: any;
}

interface UpdateStringResponse {
  message: string;
  data: any;
}

interface UploadProfileImageResponse {
  message: string;
  data: any;
}

interface UpdateUserLikesResponse {
  message: string;
  data: any;
}

interface SearchOtherUserResponse {
  message: string;
  data: any;
}

interface SearchUsersResponse {
  success: boolean;
  message: string;
  count: number;
  data: Array<{
    userID: string;
    profileImage?: string;
    fname: string;
    lname: string;
  }>;
}

interface RequestUserLogsResponse {
  message: string;
  data: any;
}

/**
 * Update a boolean field in the user document
 * @param userId - User ID from SessionContext
 * @param fieldName - The field name to update (e.g., 'visibilitySettings.isProfilePublic')
 * @param value - The boolean value to set
 * @param accessToken - JWT access token from SessionContext
 * @param updateSession - Function from useSession to update SessionContext with deep merge
 * @returns Updated user data if successful
 */

export const updateBooleanUserData = async (
  userId: string,
  fieldName: string,
  value: boolean,
  accessToken: string,
  updateSession: (sessionData: any) => Promise<void>
): Promise<UpdateBooleanResponse> => {
  try {
    const response = await fetch(`${API_URL}/update-boolean`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        userId,
        fieldName,
        value
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update boolean field');
    }

    if (responseData.data) {
      await updateSession({
        user: responseData.data
      });
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error updating boolean user data:', error);
    throw error;
  }
};

/**
 * Update a string field in the user document
 * @param userId - User ID from SessionContext
 * @param fieldName - The field name to update (e.g., 'fname')
 * @param value - The string value to set
 * @param accessToken - JWT access token from SessionContext
 * @param updateSession - Function from useSession to update SessionContext with deep merge
 * @returns Updated user data if successful
 */
export const updateStringUserData = async (
  userId: string,
  fieldName: string,
  value: string,
  accessToken: string,
  updateSession: (sessionData: any) => Promise<void>
): Promise<UpdateStringResponse> => {
  try {
    const response = await fetch(`${API_URL}/update-string`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        userId,
        fieldName,
        value
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update string field');
    }

    if (responseData.data) {
      await updateSession({
        user: responseData.data
      });
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error updating string user data:', error);
    throw error;
  }
};

/**
 * Upload a profile image for the user
 * @param userId - User ID from SessionContext
 * @param imageUri - The URI of the image file (local path)
 * @param accessToken - JWT access token from SessionContext
 * @param updateSession - Function from useSession to update SessionContext with deep merge
 * @returns Updated user data with new profileImage path if successful
 */
export const uploadProfileImage = async (
  userId: string,
  imageUri: string,
  accessToken: string,
  updateSession: (sessionData: any) => Promise<void>
): Promise<UploadProfileImageResponse> => {
  try {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('image', {
      uri: imageUri,
      name: `profile-${userId}.jpg`,
      type: 'image/jpeg',
    } as any);

    const response = await fetch(`${API_URL}/upload-profile-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to upload profile image');
    }

    if (responseData.data) {
      await updateSession({
        user: responseData.data
      });
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error uploading profile image:', error);
    throw error;
  }
};

/**
 * Update user's likes array and optionally isFirstLogin field
 * @param likes - Array of category strings that user likes
 * @param accessToken - JWT access token from SessionContext
 * @param updateSession - Function from useSession to update SessionContext with deep merge
 * @param isFirstLoginValue - Optional boolean to update isFirstLogin field
 * @returns Updated user data if successful
 */
export const updateUserLikes = async (
  likes: string[],
  accessToken: string,
  updateSession: (sessionData: any) => Promise<void>,
  isFirstLoginValue?: boolean
): Promise<UpdateUserLikesResponse> => {
  try {
    const requestBody: any = {
      likes
    };

    if (typeof isFirstLoginValue === 'boolean') {
      requestBody.isFirstLoginValue = isFirstLoginValue;
    }

    const response = await fetch(`${API_URL}/update-likes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update user likes');
    }

    if (responseData.data) {
      await updateSession({
        user: responseData.data
      });
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error updating user likes:', error);
    throw error;
  }
};

/**
 * Search for another user by username or ID
 * @param identifier - Username or User ID to search for
 * @param accessToken - JWT access token from SessionContext
 * @returns User data if found
 */
export const searchOtherUser = async (
  identifier: string,
  accessToken: string
): Promise<SearchOtherUserResponse> => {
  try {
    const response = await fetch(`${API_URL}/search/${identifier}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to search for user');
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error searching for user:', error);
    throw error;
  }
};

/**
 * Search for users by firstname, lastname, or username
 * @param searchQuery - Search string (name or username)
 * @returns Array of matching users with userID, profileImage, fname, lname
 */
export const searchUsers = async (
  searchQuery: string
): Promise<SearchUsersResponse> => {
  try {
    // Get access token
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error('No access token found');
    }

    const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchQuery)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let responseData;
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      // Response is not JSON (likely HTML error page)
      const textData = await response.text();
      console.error('❌ Non-JSON response received:', textData.substring(0, 200));
      throw new Error(`Server returned non-JSON response (${response.status}). This usually means the API endpoint is not available or there's an authentication issue.`);
    }

    if (!response.ok) {
      throw new Error(responseData.message || `Server error: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error searching for users:', error);
    throw error;
  }
};

/**
 * Request user activity logs for a date range
 * @param startDate - Start date for log request (ISO date string: YYYY-MM-DD)
 * @param endDate - End date for log request (ISO date string: YYYY-MM-DD)
 * @param accessToken - JWT access token (deprecated, uses auto-refresh internally)
 * @returns Request response with status and jobId
 */
export const requestUserLogs = async (
  startDate: string,
  endDate: string,
  accessToken?: string
): Promise<RequestUserLogsResponse> => {
  try {
    // Get access token
    const token = await getAccessToken();

    // Convert date format if needed (ensure ISO 8601 format with time)
    const startDateTime = startDate.includes('T') ? startDate : `${startDate}T00:00:00Z`;
    const endDateTime = endDate.includes('T') ? endDate : `${endDate}T23:59:59Z`;

    const response = await fetch(`${API_URL}/request-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        startDate: startDateTime,
        endDate: endDateTime
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || responseData.error || 'Failed to request user logs');
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error requesting user logs:', error);
    throw error;
  }
};
