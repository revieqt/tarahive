import { useSession } from '@/context/SessionContext';

/**
 * Hook to ensure access token is fresh (auto-refreshes if expired)
 * Use this before making API calls
 */
export const useValidatedSession = async () => {
  const { session, refreshToken } = useSession();

  if (!session?.accessToken) {
    throw new Error('No access token available');
  }

  // Check if token is expired and refresh if needed
  const decoded = decodeToken(session.accessToken);
  if (decoded && decoded.exp) {
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      console.log('🔄 Token expired, refreshing...');
      const refreshed = await refreshToken();
      if (!refreshed) {
        throw new Error('Failed to refresh token');
      }
    }
  }

  return session;
};

/**
 * Simple JWT decoder (no validation, just extraction)
 */
function decodeToken(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const decoded = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}
