import { useMutation } from '@tanstack/react-query';
import { sendEmailVerificationCode, verifyEmail } from '@/services/authService';
import { showError, showInfo, showSuccess } from '@/services/toast.service';
import { useDeviceInfo } from '@/hooks/shared/useDeviceInfo';
import { useSession } from '@/context/SessionContext';
import { saveAccessToken, saveRefreshToken } from '@/services/token.service';
import { router } from 'expo-router';

export const useEmailVerification = () => {
  const deviceInfo = useDeviceInfo();
  const { updateSession } = useSession();

  const sendCodeMutation = useMutation({
    mutationFn: async (email: string) => {
      return await sendEmailVerificationCode(
        email,
        deviceInfo.isLoaded ? deviceInfo : undefined
      );
    },
    onError: (error: any) => {
      const errorMsg = error.message || 'Failed to send verification code';
      showError('Verification Error', errorMsg);
    },
    onSuccess: (data) => {
      showInfo('Verification Code Sent', data.message);
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async (variables: { email: string; code: string }) => {
      return await verifyEmail(
        variables.email,
        variables.code,
        deviceInfo.isLoaded ? deviceInfo : undefined
      );
    },
    onError: (error: any) => {
      const errorMsg = error.message || 'Email verification failed';
      showError('Verification Error', errorMsg);
    },
    onSuccess: async (data) => {
      try {
        if (!data.user || !data.accessToken || !data.refreshToken) {
          throw new Error('The verification response is incomplete');
        }

        await Promise.all([
          saveAccessToken(data.accessToken),
          saveRefreshToken(data.refreshToken),
        ]);
        await updateSession({ user: data.user });

        showSuccess('Success', data.message);
        router.replace('/(protected)');
      } catch (error: any) {
        showError(
          'Verification Error',
          error.message || 'Failed to create your session',
        );
      }
    },
  });

  const sendCode = (email: string) => sendCodeMutation.mutateAsync(email);
  const verifyCode = (variables: { email: string; code: string }) =>
    verifyCodeMutation.mutate(variables);

  return {
    sendCode,
    sendCodeAsync: sendCodeMutation.mutateAsync,
    isSendingCode: sendCodeMutation.isPending,
    
    verifyCode,
    verifyCodeAsync: verifyCodeMutation.mutateAsync,
    isVerifying: verifyCodeMutation.isPending,
    
    isLoading: sendCodeMutation.isPending || verifyCodeMutation.isPending,
  };
};