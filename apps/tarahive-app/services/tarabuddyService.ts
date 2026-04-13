import { BACKEND_URL } from '@/constants/Config';
import { getAccessToken } from '@/utils/getAccessToken';

const API_URL = `${BACKEND_URL}/api/tarabuddy`;

export interface TaraBuddyUser {
  userID: string;
  fname: string;
  lname: string;
  username?: string;
  isProUser: boolean;
  gender: string;
  bdate: Date;
  profileImage?: string;
  bio: string;
}

export interface TaraBuddySettings {
  isTaraBuddyEnabled: boolean;
  preferredGender?: string;
  preferredDistance?: number;
  preferredAgeRange?: [number, number];
  preferredZodiac?: string[];
}

export interface LikeResponse {
  success: boolean;
  match: boolean;
  message: string;
  matchedWith?: string;
  matchedFname?: string;
}

export interface Match {
  userID: string;
  fname: string;
  lname: string;
  gender: string;
  age: number;
  profileImage?: string;
}

/**
 * Enable TaraBuddy feature
 */
export const enableTaraBuddyService = async (): Promise<TaraBuddySettings> => {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${API_URL}/enable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to enable TaraBuddy');
    }

    return data.data;
  } catch (error) {
    console.error('❌ Error enabling TaraBuddy:', error);
    throw error;
  }
};

/**
 * Disable TaraBuddy feature
 */
export const disableTaraBuddyService = async (): Promise<TaraBuddySettings> => {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${API_URL}/disable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to disable TaraBuddy');
    }

    return data.data;
  } catch (error) {
    console.error('❌ Error disabling TaraBuddy:', error);
    throw error;
  }
};

/**
 * Search for TaraBuddy matches
 */
export const searchTaraBuddiesService = async (): Promise<TaraBuddyUser[]> => {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${API_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to search TaraBuddies');
    }

    return data.data || [];
  } catch (error) {
    console.error('❌ Error searching TaraBuddies:', error);
    throw error;
  }
};

/**
 * Like a TaraBuddy user
 */
export const likeTaraBuddyService = async (likedUserId: string): Promise<LikeResponse> => {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${API_URL}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ likedUserId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to like TaraBuddy user');
    }

    return data;
  } catch (error) {
    console.error('❌ Error liking TaraBuddy user:', error);
    throw error;
  }
};

/**
 * Update gender preference
 */
export const updateGenderPreferenceService = async (
  preference: string
): Promise<TaraBuddySettings> => {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${API_URL}/update-gender-preference`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ preference }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update gender preference');
    }

    return data.data;
  } catch (error) {
    console.error('❌ Error updating gender preference:', error);
    throw error;
  }
};

/**
 * Update distance preference
 */
export const updateDistancePreferenceService = async (
  preference: number
): Promise<TaraBuddySettings> => {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${API_URL}/update-distance-preference`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ preference }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update distance preference');
    }

    return data.data;
  } catch (error) {
    console.error('❌ Error updating distance preference:', error);
    throw error;
  }
};

/**
 * Update age range preference
 */
export const updateAgePreferenceService = async (
  preference: [number, number]
): Promise<TaraBuddySettings> => {
  try {
    console.log('🟡 updateAgePreferenceService - Sending preference:', preference, 'types:', typeof preference[0], typeof preference[1]);
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      throw new Error('No access token found');
    }

    const response = await fetch(`${API_URL}/update-age-preference`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ preference }),
    });

    console.log('📤 Response received. Status:', response.status);

    let data;
    try {
      data = await response.json();
      console.log('📦 Response data:', JSON.stringify(data));
    } catch (parseError) {
      console.error('❌ Failed to parse response JSON:', parseError);
      throw new Error('Invalid response format from server');
    }

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `HTTP ${response.status}: Failed to update age preference`;
      console.error('❌ API Error:', errorMsg);
      throw new Error(errorMsg);
    }

    if (!data?.data) {
      console.error('❌ No data in response:', data);
      throw new Error('No settings returned from server');
    }

    console.log('✅ Age preference response data:', data.data);
    return data.data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Error in updateAgePreferenceService:', errorMsg);
    throw error;
  }
};

/**
 * Update zodiac preference
 */
export const updateZodiacPreferenceService = async (
  preference: string[]
): Promise<TaraBuddySettings> => {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${API_URL}/update-zodiac-preference`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ preference }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update zodiac preference');
    }

    return data.data;
  } catch (error) {
    console.error('❌ Error updating zodiac preference:', error);
    throw error;
  }
};

/**
 * Get all mutual matches for the current user
 */
export const getMatchesService = async (): Promise<Match[]> => {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${API_URL}/matches`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get matches');
    }

    return data.data || [];
  } catch (error) {
    console.error('❌ Error getting matches:', error);
    throw error;
  }
};

/**
 * Unmatch with a TaraBuddy user
 */
export const unmatchService = async (userID: string): Promise<{ success: boolean; message: string }> => {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${API_URL}/unmatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ userID }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to unmatch user');
    }

    return data;
  } catch (error) {
    console.error('❌ Error unmatching user:', error);
    throw error;
  }
};
