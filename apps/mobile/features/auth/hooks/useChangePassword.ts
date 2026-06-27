import { useMutation } from '@tanstack/react-query';
import { changePassword } from '@/features/auth/services/auth.service';
import { useDeviceInfo } from '@/shared/hooks/useDeviceInfo';
import { useSession } from '@/features/auth/context/SessionContext';
import { showError, showInfo } from '@/shared/services/toast.service';
import { ChangePasswordResponse } from '../types/auth.types';
import { saveAccessToken, saveRefreshToken } from '../services/token.service';

export const useChangePassword = () => {
  const deviceInfo = useDeviceInfo();
  const { updateSession } = useSession();

  const mutation = useMutation({
    mutationFn: async (variables: {
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      if (!variables.oldPassword || !variables.newPassword || !variables.confirmPassword) {
        throw new Error('All password fields are required');
      }

      if (variables.newPassword !== variables.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (variables.newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }

      if (!deviceInfo.isLoaded) {
        throw new Error('Device info not yet loaded');
      }

      // Call API
      return await changePassword(
        variables.oldPassword,
        variables.newPassword,
        variables.confirmPassword,
        deviceInfo
      );
    },

    onSuccess: async (response: ChangePasswordResponse) => {
      try {
        // Update tokens
        await saveAccessToken(response.accessToken);
        await saveRefreshToken(response.refreshToken);

        showInfo('Success', response.message || 'Password changed successfully');
      } catch (err: any) {
        throw new Error('Failed to save tokens: ' + err.message);
      }
    },

    onError: (error: any) => {
      const errorMsg = error.message || 'Failed to change password';
      showError('Error', errorMsg);
    },
  });

  return {
    changePassword: mutation.mutate,
    changePasswordAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};
