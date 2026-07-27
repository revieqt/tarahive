import { useMutation } from '@tanstack/react-query';
import { useSession } from '@/features/auth/context/SessionContext';
import { updateVisibilitySettings } from '../services/userService';
import { showError, showInfo } from '@/shared/services/toast.service';
import { UpdateVisibilitySettingsPayload } from '../types/userTypes';

export const useUpdateVisibilitySettings = () => {
  const { session, updateSession } = useSession();

  const mutation = useMutation({
    mutationFn: async (payload: UpdateVisibilitySettingsPayload) => {
      const currentVisibility = session?.user?.settings?.visibility;

      const hasChanges =
        currentVisibility?.isProfilePublic !== payload.visibility.isProfilePublic ||
        currentVisibility?.isPersonalInfoPublic !== payload.visibility.isPersonalInfoPublic ||
        currentVisibility?.isTravelInfoPublic !== payload.visibility.isTravelInfoPublic;

      if (!hasChanges) {
        return {
          success: true,
          message: 'No changes detected. Settings already up to date.',
        };
      }

      const response = await updateVisibilitySettings(payload);

      if (!response.success) {
        throw new Error(response.message || 'Failed to update visibility settings');
      }

      return response;
    },
    onSuccess: async (_response, payload) => {
      try {
        await updateSession({
          user: {
            ...(session?.user || {}),
            settings: {
              ...(session?.user?.settings || {}),
              visibility: {
                ...(session?.user?.settings?.visibility || {}),
                ...payload.visibility,
              },
            },
          } as any,
        });

        showInfo('Success', _response.message || 'Visibility settings updated successfully');
      } catch (error: any) {
        showError('Error', error.message || 'Failed to update local session');
      }
    },
    onError: (error: any) => {
      const errorMsg = error.message || 'Failed to update visibility settings';
      showError('Error', errorMsg);
    },
  });

  return {
    updateVisibilitySettings: mutation.mutate,
    updateVisibilitySettingsAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    status: mutation.status,
    reset: mutation.reset,
  };
};
