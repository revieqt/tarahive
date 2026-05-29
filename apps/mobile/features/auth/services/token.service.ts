import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEYS = {
  ACCESS_TOKEN: '@tarahive_access_token',
  REFRESH_TOKEN: '@tarahive_refresh_token',
};

export const saveAccessToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
  }
  catch (error) {
    console.error('[tokenService] Error saving access token:', error);
    throw error;
  }
};

export const saveRefreshToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token);
  }
  catch (error) {
    console.error('[tokenService] Error saving refresh token:', error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string> => {
  try {
    const session = await AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    if (!session) {
      throw new Error('No session found. User must be logged in.');
    }
    const parsed = JSON.parse(session);
    if (!parsed.accessToken) {
      throw new Error('No access token found in session.');
    }
    return parsed.accessToken;
  } catch (error) {
    console.error('[tokenService] Error getting access token:', error);
    throw error;
  }
};

export const getRefreshToken = async (): Promise<string> => {
  try {
    const session = await AsyncStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    if (!session) {
      throw new Error('No session found. User must be logged in.');
    }
    const parsed = JSON.parse(session);
    if (!parsed.refreshToken) {
      throw new Error('No refresh token found in session.');
    }
    return parsed.refreshToken;
  } catch (error) {
    console.error('[tokenService] Error getting refresh token:', error);
    throw error;
  }
};