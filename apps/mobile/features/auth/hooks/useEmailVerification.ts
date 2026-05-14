import { sendEmailVerificationCode, verifyEmail } from '@/features/auth/services/auth.service';
import { useDeviceInfo } from '@/shared/hooks/useDeviceInfo';
import { useState } from 'react';
import { showError } from '@/shared/services/toast.service';

export const useEmailVerification = () => {
  const deviceInfo = useDeviceInfo();
  const [loading, setLoading] = useState(false);

  const sendCode = async (email: string) => {
    setLoading(true);
    try {
      if (!deviceInfo.isLoaded){
        showError('Error', 'Please try again in a moment.');
      }else{
        const response = await sendEmailVerificationCode(email, deviceInfo);
        return response;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to send verification code';
      showError('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (email: string, code: string) => {
    setLoading(true);
    
    try {
      if (!deviceInfo.isLoaded){
        showError('Error', 'Please try again in a moment.');
      }else{
        const result = await verifyEmail(email, code, deviceInfo);
        return result;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Email verification failed';
      showError('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendCode, verifyCode, loading };
};