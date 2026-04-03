/**
 * Simple token helper for services
 * Import this and call getValidToken() before API calls to ensure token is fresh
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@/constants/Config';

// Simple JWT decoder
function decodeToken(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
  } catch (error) {
    return null;
  }
}

// Check if token is expired
function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp < Math.floor(Date.now() / 1000);
}

// Refresh token via backend
async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) throw new Error('Token refresh failed');
  return response.json();
}

/**
 * Gets a valid access token, refreshing if needed
 * Usage in services:
 *   const token = await getValidToken();
 *   // Now use token in your API call
 */
export const getValidToken = async (): Promise<string> => {
  try {
    const session = await AsyncStorage.getItem('session');
    if (!session) throw new Error('No session found');

    let parsed = JSON.parse(session);
    const { accessToken, refreshToken } = parsed;

    // If token is still valid, return it
    if (!isTokenExpired(accessToken)) {
      return accessToken;
    }

    // Token expired, refresh it
    console.log('🔄 Token expired, refreshing...');
    const { accessToken: newToken, refreshToken: newRefresh } = 
      await refreshAccessToken(refreshToken);

    // Update session with new tokens
    parsed.accessToken = newToken;
    parsed.refreshToken = newRefresh;
    await AsyncStorage.setItem('session', JSON.stringify(parsed));

    console.log('✅ Token refreshed');
    return newToken;
  } catch (error) {
    console.error('❌ Error getting valid token:', error);
    throw error;
  }
};
