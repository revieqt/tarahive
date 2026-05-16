import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/features/auth/context/SessionContext';
import { Dialog } from '@/shared/services/dialog.service';
import { useCallback } from 'react';

export function useDev() {
  const queryClient = useQueryClient();
  const { clearSession } = useSession();

  const clearCache = useCallback(async () => {
    Dialog.confirm(
      'Clear Cache',
      'This will clear all cached data and log you out. Continue?',
      {
        confirmText: 'Clear',
        cancelText: 'Cancel',
        destructive: true,
        onConfirm: async () => {
          try {
            // Clear AsyncStorage
            await AsyncStorage.clear();

            // Clear TanStack QueryClient cache
            queryClient.clear();

            // Clear session
            await clearSession();

            // Redirect to login
            router.replace('/login');
          } catch (error) {
            console.error('Failed to clear cache:', error);
          }
        },
      }
    );
  }, [queryClient, clearSession]);

  return { clearCache };
}
