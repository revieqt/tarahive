import { api } from '@/shared/api/client';
import { DeviceInfo } from '@/shared/hooks/useDeviceInfo';
import { formatDeviceInfo } from '@/shared/utils/deviceFormatter';

const API_URL = '/v1/auth';

export interface RegisterRequest {
  fname: string;
  lname?: string;
  email: string;
  password: string;
  confirmPassword: string;
  bdate: string;
  gender: string;
  device?: DeviceInfo;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  email: string;
  nextStep?: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  email?: string;
  user?: any;
}

/**
 * Register a new user
 * Backend automatically sends verification code to email
 */
export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const payload = {
    fname: data.fname,
    lname: data.lname || undefined,
    email: data.email,
    password: data.password,
    bdate: data.bdate,
    gender: data.gender,
    device: data.device ? formatDeviceInfo(data.device) : undefined,
  };

  return await api.post<RegisterResponse>(`${API_URL}/register`, payload);
};

/**
 * Send email verification code (for resending)
 */
export const sendEmailVerificationCode = async (
  email: string,
  device?: DeviceInfo
): Promise<VerificationResponse> => {
  const payload = {
    email,
    device: device ? formatDeviceInfo(device) : undefined,
  };

  return await api.post<VerificationResponse>(`${API_URL}/send-verification`, payload);
};

/**
 * Verify email with code and complete registration
 */
export const verifyEmail = async (
  email: string,
  code: string,
  device?: DeviceInfo
): Promise<VerificationResponse> => {
  const payload = {
    email,
    code,
    device: device ? formatDeviceInfo(device) : undefined,
  };

  return await api.post<VerificationResponse>(`${API_URL}/verify`, payload);
};
