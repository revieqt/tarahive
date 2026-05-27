import { api } from '@/shared/api/client';
import { formatDeviceInfo } from '@/shared/utils/deviceFormatter';
import { DeviceInfo } from '@/shared/hooks/useDeviceInfo';
import { RegisterRequest, RegisterResponse, VerificationResponse, LoginRequest, LoginResponse } from '../types/auth.types';

const API_URL = '/v1/auth';

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

/**
 * Login user with email/username and password
 */
export const loginUser = async (
  identifier: string,
  password: string,
  device?: DeviceInfo
): Promise<LoginResponse> => {
  const payload = {
    identifier,
    password,
    device: device ? formatDeviceInfo(device) : undefined,
  };

  return await api.post<LoginResponse>(`${API_URL}/login`, payload);
};
