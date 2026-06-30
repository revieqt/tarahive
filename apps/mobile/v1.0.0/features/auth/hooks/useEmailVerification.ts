import { useMutation } from '@tanstack/react-query';
import { sendEmailVerificationCode, verifyEmail } from '@/features/auth/services/auth.service';
import { showError, showInfo } from '@/shared/services/toast.service';
import { useDeviceInfo } from '@/shared/hooks/useDeviceInfo';

export const useEmailVerification = () => {
  const deviceInfo = useDeviceInfo();

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
    onSuccess: (data) => {
      showInfo('Success', data.message);
    },
  });

  return {
    sendCode: sendCodeMutation.mutate,
    sendCodeAsync: sendCodeMutation.mutateAsync,
    isSendingCode: sendCodeMutation.isPending,
    
    verifyCode: verifyCodeMutation.mutate,
    verifyCodeAsync: verifyCodeMutation.mutateAsync,
    isVerifying: verifyCodeMutation.isPending,
    
    isLoading: sendCodeMutation.isPending || verifyCodeMutation.isPending,
  };
};