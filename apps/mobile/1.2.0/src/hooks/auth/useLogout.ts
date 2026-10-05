import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/context/SessionContext';
import { showInfo } from '@/services/toast.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const TOKEN_KEYS = {
  ACCESS_TOKEN: '@tarahive_access_token',
  REFRESH_TOKEN: '@tarahive_refresh_token',
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { clearSession } = useSession();

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      await AsyncStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
      await clearSession();
      queryClient.clear();
      
      router.replace('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  }, [queryClient, clearSession]);

  return { logout };
};
