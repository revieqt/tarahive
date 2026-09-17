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
    const token = await AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    if (!token) {
      throw new Error('No access token found. User must be logged in.');
    }
    return token;
  } catch (error) {
    console.error('[tokenService] Error getting access token:', error);
    throw error;
  }
};

export const getRefreshToken = async (): Promise<string> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    if (!token) {
      throw new Error('No refresh token found. User must be logged in.');
    }
    return token;
  } catch (error) {
    console.error('[tokenService] Error getting refresh token:', error);
    throw error;
  }
};

export const clearAccessToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('[tokenService] Error clearing access token:', error);
    throw error;
  }
};

export const clearRefreshToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('[tokenService] Error clearing refresh token:', error);
    throw error;
  }
};

export const clearAllTokens = async () => {
  try {
    await Promise.all([clearAccessToken(), clearRefreshToken()]);
  } catch (error) {
    console.error('[tokenService] Error clearing all tokens:', error);
    throw error;
  }
};