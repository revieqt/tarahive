import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/features/auth/context/SessionContext';
import { Dialog } from '@/shared/services/dialog.service';
import { useCallback } from 'react';
import { useLanguage } from '@/shared/context/LanguageContext';

export function useDev() {
  const queryClient = useQueryClient();
  const { clearSession } = useSession();
  const { t } = useLanguage();
  const clearCache = useCallback(async () => {
    
    Dialog.confirm(
      t('common.dev.cache_clear_title'),
      t('common.dev.cache_clear_subtitle'),
      {
        confirmText: t('common.common.continue'),
        cancelText: t('common.common.cancel'),
        destructive: true,
        onConfirm: async () => {
          try {
            await AsyncStorage.clear();
            queryClient.clear();
            await clearSession();
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
