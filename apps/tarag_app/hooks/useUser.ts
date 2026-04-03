import { useState } from 'react';
import { searchOtherUser, requestUserLogs, searchUsers } from '@/services/userService';
import { useSession } from '@/context/SessionContext';

/**
 * Custom hook for user operations
 * Handles searching for other users and requesting user logs
 */
export const useUser = () => {
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchOtherUser = async (identifier: string) => {
    if (!session?.accessToken) {
      const errorMsg = 'Access token not found';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!identifier || typeof identifier !== 'string') {
      const errorMsg = 'Invalid identifier provided';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await searchOtherUser(identifier, session.accessToken);
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to search for user';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestUserLogs = async (startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
      const errorMsg = 'Start date and end date are required';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsLoading(true);
    setError(null);

    try {
      // Service now handles token refresh internally
      const response = await requestUserLogs(startDate, endDate);
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to request user logs';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchUsers = async (searchQuery: string) => {
    if (!searchQuery || typeof searchQuery !== 'string') {
      const errorMsg = 'Invalid search query provided';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await searchUsers(searchQuery);
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to search for users';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchOtherUser: handleSearchOtherUser,
    requestUserLogs: handleRequestUserLogs,
    searchUsers: handleSearchUsers,
    isLoading,
    error,
  };
};
