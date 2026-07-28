import { useMutation } from '@tanstack/react-query';
import { useSession } from '@/features/auth/context/SessionContext';
import { updateProfile } from '../services/userService';
import { showError, showInfo } from '@/shared/services/toast.service';
import { UpdateProfilePayload } from '../types/userTypes';

export const useUpdateProfile = () => {
  const { session, updateSession } = useSession();

  const mutation = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const currentUser = session?.user;
      const hasChanges = Object.entries(payload).some(([key, value]) => {
        const currentValue = currentUser?.[key as keyof typeof currentUser];
        return JSON.stringify(currentValue) !== JSON.stringify(value);
      });

      if (!hasChanges) {
        return {
          success: true,
          message: 'No changes detected. Profile already up to date.',
        };
      }

      const response = await updateProfile(payload);

      if (!response.success) {
        throw new Error(response.message || 'Failed to update profile');
      }

      return response;
    },
    onSuccess: async (_response, payload) => {
      try {
        await updateSession({
          user: {
            ...(session?.user || {}),
            ...payload,
          } as any,
        });

        showInfo('Success', _response.message || 'Profile updated successfully');
      } catch (error: any) {
        showError('Error', error.message || 'Failed to update local session');
      }
    },
    onError: (error: any) => {
      const errorMsg = error.message || 'Failed to update profile';
      showError('Error', errorMsg);
    },
  });

  return {
    updateProfile: mutation.mutate,
    updateProfileAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    status: mutation.status,
    reset: mutation.reset,
  };
};
