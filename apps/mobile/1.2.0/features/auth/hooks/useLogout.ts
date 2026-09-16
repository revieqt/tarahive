import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/features/auth/context/SessionContext';
import { showInfo } from '@/shared/services/toast.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEYS = {
  ACCESS_TOKEN: '@tarahive_access_token',
  REFRESH_TOKEN: '@tarahive_refresh_token',
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { clearSession } = useSession();

  const logout = useCallback(async () => {
    try {
      // Clear tokens from AsyncStorage
      await AsyncStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      await AsyncStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);

      // Clear session context
      await clearSession();

      // Clear Tanstack Query cache
      queryClient.clear();

      showInfo('Success', 'Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  }, [queryClient, clearSession]);

  return { logout };
};
