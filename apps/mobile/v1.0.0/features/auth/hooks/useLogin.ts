import { useMutation } from '@tanstack/react-query';
import { loginUser } from '@/features/auth/services/auth.service';
import { useDeviceInfo } from '@/shared/hooks/useDeviceInfo';
import { useSession } from '@/features/auth/context/SessionContext';
import { showError, showInfo } from '@/shared/services/toast.service';
import { LoginResponse } from '../types/auth.types';
import { saveAccessToken, saveRefreshToken } from '../services/token.service';

export const useLogin = () => {
  const deviceInfo = useDeviceInfo();
  const { updateSession } = useSession();

  const mutation = useMutation({
    mutationFn: async (variables: { identifier: string; password: string }) => {
      if (!variables.identifier || !variables.password) {
        throw new Error('Email and password are required');
      }

      if (!deviceInfo.isLoaded) {
        throw new Error('Device info not yet loaded');
      }

      // Call API
      return await loginUser(variables.identifier, variables.password, deviceInfo);
    },

    onSuccess: async (response: LoginResponse) => {
      try {
        // Transform user data to match SessionContext User type
        const userData = {
          id: response.user.id,
          fname: response.user.fname,
          lname: response.user.lname || undefined,
          username: response.user.username,
          email: response.user.email,
          bdate: new Date(response.user.bdate),
          gender: response.user.gender,
          contactNumber: response.user.contactNumber,
          profileImage: response.user.profileImage,
          isProUser: response.user.isProUser,
          bio: response.user.bio || '',
          status: response.user.status,
          type: response.user.type,
          provider: response.user.provider,
          createdOn: new Date(response.user.createdOn),
          updatedOn: response.user.updatedOn ? new Date(response.user.updatedOn) : undefined,
          isFirstLogin: response.user.isFirstLogin,
          expPoints: response.user.expPoints,
          interests: response.user.interests || [],
          safetyState: response.user.safetyState,
          settings: response.user.settings,
          device: response.user.device || [],
        };

        await saveAccessToken(response.accessToken);
        await saveRefreshToken(response.refreshToken);

        await updateSession({
          user: userData,
        });

        showInfo('Success', response.message || 'Login successful');
      } catch (err: any) {
        throw new Error('Failed to save session: ' + err.message);
      }
    },

    onError: (error: any) => {
      const errorMsg = error.message || 'Login failed';
      showError('Login Error', errorMsg);
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};
