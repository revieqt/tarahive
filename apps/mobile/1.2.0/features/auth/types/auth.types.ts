import { DeviceInfo } from '@/shared/hooks/useDeviceInfo';

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

export interface LoginRequest {
  identifier: string;
  password: string;
  device?: DeviceInfo;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: any;
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  device?: DeviceInfo;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
}