import { 
  registerUser, 
  sendEmailVerificationCode, 
  verifyEmail,
} from '@/features/auth/services/auth.service';
import { useDeviceInfo } from '../../../shared/hooks/useDeviceInfo';
import { useState } from 'react';
import { calculateAge } from '@/shared/utils/calculateAge';
import { RegisterData } from '@/features/auth/types/auth.types';
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

export const useRegister = () => {
  const deviceInfo = useDeviceInfo();
  const [loading, setLoading] = useState(false);

  const validate = (data: RegisterData) => {
    if (
      !data.fname ||
      !data.bdate ||
      !data.gender ||
      !data.email ||
      !data.password ||
      !data.confirmPassword
    ) showError('Error', 'Required fields must not be empty.');

    const age = calculateAge(new Date(data.bdate));

    if (age < 13) showError('Error', 'Must be at least 13 years old');

    if (data.password !== data.confirmPassword) showError('Error', 'Passwords do not match');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(data.email)) showError('Error', 'Invalid email');

    if (data.password.length < 6) showError('Error', 'Password too short');
  };

  const register = async (data: RegisterData) => {
    setLoading(true);

    try {
      validate(data);

      if (!deviceInfo.isLoaded) {
        throw new Error('Device info not loaded');
      }

      return await registerUser(data, deviceInfo);
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
  };
};