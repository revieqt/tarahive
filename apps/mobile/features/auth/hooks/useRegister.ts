import { registerUser } from '@/features/auth/services/auth.service';
import { useDeviceInfo } from '@/shared/hooks/useDeviceInfo';
import { useState } from 'react';
import { calculateAge } from '@/shared/utils/calculateAge';
import { RegisterRequest } from '@/features/auth/types/auth.types';
import { showError } from '@/shared/services/toast.service';

export const useRegister = () => {
  const deviceInfo = useDeviceInfo();
  const [loading, setLoading] = useState(false);

  const validate = (data: RegisterRequest) => {
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

  const register = async (data: RegisterRequest) => {
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