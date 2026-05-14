import { registerUser, sendEmailVerificationCode, verifyEmail } from '@/features/auth/services/register.service';
import { useState } from 'react';
import { calculateAge } from '@/shared/utils/calculateAge';
import { RegisterRequest } from '@/features/auth/services/register.service';
import { showError } from '@/shared/services/toast.service';

export const useRegister = () => {
  const [loading, setLoading] = useState(false);

  const validate = (data: RegisterRequest) => {
    if (
      !data.fname ||
      !data.bdate ||
      !data.gender ||
      !data.email ||
      !data.password ||
      !data.confirmPassword
    ) throw new Error('Required fields must not be empty.');

    const age = calculateAge(new Date(data.bdate));

    if (age < 13) throw new Error('Must be at least 13 years old');

    if (data.password !== data.confirmPassword) throw new Error('Passwords do not match');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(data.email)) throw new Error('Invalid email');

    if (data.password.length < 6) throw new Error('Password too short');
  };

  const register = async (data: RegisterRequest) => {
    setLoading(true);

    try {
      validate(data);
      return await registerUser(data);
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
  };
};


export const useEmailVerification = () => {
  const [loading, setLoading] = useState(false);

  const sendCode = async (email: string) => {
    setLoading(true);
    try {
      const response = await sendEmailVerificationCode(email);
      return response;
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
      const result = await verifyEmail(email, code);
      return result;
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