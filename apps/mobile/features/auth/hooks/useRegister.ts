import { useMutation } from '@tanstack/react-query';
import { registerUser } from '@/features/auth/services/auth.service';
import { calculateAge } from '@/shared/utils/calculateAge';
import { RegisterRequest } from '@/features/auth/services/auth.service';
import { showError, showInfo } from '@/shared/services/toast.service';
import { useDeviceInfo } from '@/shared/hooks/useDeviceInfo';

export const useRegister = () => {
  const deviceInfo = useDeviceInfo();

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

    if (data.password.length < 6) throw new Error('Password must be at least 6 characters');
  };

  const mutation = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      validate(data);
      return await registerUser({
        ...data,
        device: deviceInfo.isLoaded ? deviceInfo : undefined,
      });
    },
    onError: (error: any) => {
      const errorMsg = error.message || 'Registration failed';
      showError('Registration Error', errorMsg);
    },
    onSuccess: (data) => {
      showInfo('Success', data.message);
    },
  });

  return {
    register: mutation.mutate,
    registerAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};