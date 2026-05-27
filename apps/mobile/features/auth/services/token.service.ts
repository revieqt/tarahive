import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAccessToken = async (): Promise<string> => {
  try {
    const session = await AsyncStorage.getItem('@tarahive_access_token');
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